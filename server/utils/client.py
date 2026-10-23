from google import genai
from google.genai import errors as genai_errors
from openai import OpenAI
import os
from utils.constants import ( 
    GEMINI_FLASH_MODEL, 
    GEMINI_FLASH_LITE_MODEL, 
    OPENAI_GPT4O_MINI_MODEL,
    OPENAI_GPT4_1_MINI_MODEL,
    OPENAI_GPT_5_MINI_MODEL,
)
from pydantic import BaseModel
import traceback

class LLMClient:
    def __init__(self, mode):
        if mode == "gemini":
            self.client = genai.Client()
            self.openai_compat_model = OPENAI_GPT4_1_MINI_MODEL
            self._openai_fallback = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        elif mode == "openai":
            self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
            self.openai_compat_model = OPENAI_GPT4_1_MINI_MODEL
        else:
            raise ValueError(f"Unsupported LLM mode: {mode}")
        self.mode = mode

    def generate_response(self, prompt: str, schema: BaseModel, model: str = None, system_prompt: str = None, temperature: float = 1.0, file=None, filepath: str = None) -> BaseModel:
        if self.mode == "gemini":
            try:
                return self._gemini_structured_response(prompt, schema, model, system_prompt=system_prompt, temperature=temperature, file=file)
            except genai_errors.ServerError as e:
                if e.code == 503:
                    if filepath is not None:
                        print(f"Gemini 503 unavailable — falling back to {self.openai_compat_model} with file")
                        return self._openai_parse_structured_response_with_file(filepath, prompt, schema, self._openai_fallback, self.openai_compat_model, system_prompt=system_prompt, temperature=temperature)
                    elif file is None:
                        print(f"Gemini 503 unavailable — falling back to {self.openai_compat_model}")
                        return self._openai_parse_structured_response(prompt, schema, self._openai_fallback, self.openai_compat_model, system_prompt=system_prompt, temperature=temperature)
                traceback.print_exc()
                raise Exception("Something went wrong")
        return self._openai_parse_structured_response(prompt, schema, self.client, self.openai_compat_model, system_prompt=system_prompt, temperature=temperature)

    def upload_file(self, filepath: str):
        """Upload a file to the Gemini Files API. Gemini mode only."""
        uploaded = self.client.files.upload(file=filepath)
        return self.client.files.get(name=uploaded.name)

    def delete_file(self, file) -> None:
        """Delete a file from the Gemini Files API. Gemini mode only."""
        self.client.files.delete(name=file.name)

    def _gemini_structured_response(self, prompt: str, schema: BaseModel, model: str = None, system_prompt: str = None, temperature: float = 1.0, file=None) -> dict:
        """
        Uses gemini to create structured response that is validated by json schema
        """
        try:
            config = {
                "response_mime_type": "application/json",
                "response_json_schema": schema.model_json_schema(),
                "temperature": temperature,
            }
            if system_prompt:
                config["system_instruction"] = system_prompt
            contents = [prompt, file] if file else [prompt]
            response = self.client.models.generate_content(
                model=model or GEMINI_FLASH_LITE_MODEL,
                contents=contents,
                config=config,
            )
            validated_schema = schema.model_validate_json(response.text)
            return validated_schema
        except genai_errors.ServerError:
            raise
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong")

    def _openai_parse_structured_response(self, prompt: str, schema: type[BaseModel], client: OpenAI, model: str, system_prompt: str = None, temperature: float = 1.0) -> BaseModel:
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            response = client.beta.chat.completions.parse(
                model=model,
                messages=messages,
                response_format=schema,
                temperature=temperature,
            )
            result = response.choices[0].message.parsed
            if result is None:
                raise Exception("Model returned an empty response")
            return result
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong")

    def _openai_parse_structured_response_with_file(self, filepath: str, prompt: str, schema: type[BaseModel], client: OpenAI, model: str, system_prompt: str = None, temperature: float = 1.0) -> BaseModel:
        uploaded_file = None
        try:
            with open(filepath, "rb") as f:
                uploaded_file = client.files.create(file=f, purpose="user_data")
            content = [
                {"type": "text", "text": prompt},
                {"type": "file", "file": {"file_id": uploaded_file.id}},
            ]
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": content})
            response = client.beta.chat.completions.parse(
                model=model,
                messages=messages,
                response_format=schema,
                temperature=temperature,
            )
            result = response.choices[0].message.parsed
            if result is None:
                raise Exception("Model returned an empty response")
            return result
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong")
        finally:
            if uploaded_file:
                try:
                    client.files.delete(uploaded_file.id)
                except Exception:
                    pass
