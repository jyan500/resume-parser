from google import genai
from openai import OpenAI
import os
from utils.constants import ( GEMINI_FLASH_LITE_MODEL, MINIMAX_M2_5_MODEL )
from pydantic import BaseModel
import traceback
import json

class LLMClient:
    def __init__(self, mode):
        self.client = genai.Client() if mode == "gemini" else OpenAI(
            api_key=os.environ.get("OPENROUTER_API_KEY"),
            base_url=os.environ.get("OPENROUTER_BASE_URL"),
        )
        self.mode = mode
    
    def generate_response(self, prompt: str, schema_name: str, schema: BaseModel) -> BaseModel:
        if (self.mode == "gemini"):
            return self._gemini_structured_response(prompt, schema)
        return self._openrouter_gen_structured_response(prompt, schema_name, schema)

    def _gemini_structured_response(self, prompt: str, schema: BaseModel) -> dict:
        """
        Uses gemini to create structured response that is validated by json schema
        """
        try:
            response = self.client.models.generate_content(
                model=GEMINI_FLASH_LITE_MODEL,
                contents=[prompt],
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": schema.model_json_schema(),
                },
            )
            validated_schema = schema.model_validate_json(response.text)
            return validated_schema
        except Exception as e:
            traceback.print_exc()
            raise Exception("Something went wrong")

    def _openrouter_gen_structured_response(self, prompt: str, schema_name: str, schema: BaseModel) -> dict:
        """
        Call OpenRouter with a JSON schema enforced via response_format.
        Falls back to extracting JSON from the raw text if the model
        does not support the structured-output parameter.
        """
        response = None
        try:
            response = self.client.chat.completions.create(
                model=MINIMAX_M2_5_MODEL,
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
                    model=MINIMAX_M2_5_MODEL,
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
        
        if response:
            raw_text = response.choices[0].message.content
            validated_schema = schema.model_validate_json(raw_text)
            return validated_schema

        return {}