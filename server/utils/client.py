from google import genai
from google.genai import errors as genai_errors
from openai import OpenAI
import os
from utils.constants import ( GEMINI_FLASH_MODEL, GEMINI_FLASH_LITE_MODEL, OPENAI_GPT_OSS_120B_MODEL, OPENAI_GPT4O_MINI_MODEL)
from pydantic import BaseModel
import traceback
import json

class LLMClient:
    def __init__(self, mode):
        if mode == "gemini":
            self.client = genai.Client()
            self.openai_compat_model = OPENAI_GPT4O_MINI_MODEL
            self._openai_fallback = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        elif mode == "openai":
            self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
            self.openai_compat_model = OPENAI_GPT4O_MINI_MODEL
        else:
            self.client = OpenAI(
                api_key=os.environ.get("OPENROUTER_API_KEY"),
                base_url=os.environ.get("OPENROUTER_BASE_URL"),
            )
            self.openai_compat_model = OPENAI_GPT_OSS_120B_MODEL
        self.mode = mode
    
    def generate_response(self, prompt: str, schema_name: str, schema: BaseModel, model: str = None) -> BaseModel:
        if self.mode == "gemini":
            try:
                return self._gemini_structured_response(prompt, schema, model)
            except genai_errors.ServerError as e:
                if e.code == 503:
                    print(f"Gemini 503 unavailable — falling back to {self.openai_compat_model}")
                    return self._openai_parse_structured_response(prompt, schema, self._openai_fallback, self.openai_compat_model)
                traceback.print_exc()
                raise Exception("Something went wrong")
        if self.mode == "openai":
            return self._openai_parse_structured_response(prompt, schema, self.client, self.openai_compat_model)
        # openrouter
        return self._openai_compat_structured_response(prompt, schema_name, schema)

    def _gemini_structured_response(self, prompt: str, schema: BaseModel, model: str = None) -> dict:
        """
        Uses gemini to create structured response that is validated by json schema
        """
        try:
            response = self.client.models.generate_content(
                model=model or GEMINI_FLASH_LITE_MODEL,
                contents=[prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": schema.model_json_schema(),
                },
            )
            validated_schema = schema.model_validate_json(response.text)
            return validated_schema
        except genai_errors.ServerError:
            raise
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong")

    def _openai_parse_structured_response(self, prompt: str, schema: type[BaseModel], client: OpenAI, model: str) -> BaseModel:
        try:
            response = client.beta.chat.completions.parse(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                response_format=schema,
            )
            result = response.choices[0].message.parsed
            if result is None:
                raise Exception("Model returned an empty response")
            return result
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong")

    def _openai_compat_structured_response(self, prompt: str, schema_name: str, schema: BaseModel) -> dict:
        """
        Call OpenRouter with a JSON schema enforced via response_format.
        Falls back to extracting JSON from the raw text if the model
        does not support the structured-output parameter.
        """
        response = None
        try:
            response = self.client.chat.completions.create(
                model=self.openai_compat_model,
                messages=[{"role": "user", "content": prompt}],
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name":  schema_name,
                        "strict": True,
                        "schema": schema.model_json_schema(),
                    }
                }
            )
        except Exception:
            try:
                response = self.client.chat.completions.create(
                    model=self.openai_compat_model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You must respond with valid JSON only - no markdown fences, "
                                "no extra text. Follow this schema exactly: \n"
                                + json.dumps(schema.model_json_schema(), indent=2)
                            )
                        },
                        {
                            "role": "user", "content": prompt
                        }
                    ]
                )
            except Exception as e:
                traceback.print_exc()
                raise Exception("Something went wrong")
        
        if response and response.choices and len(response.choices) > 0:
            raw_text = response.choices[0].message.content
            if not raw_text:
                raise Exception("Model returned an empty response")
            validated_schema = schema.model_validate_json(raw_text)
            return validated_schema

        raise Exception("No valid response from model")
        