# backend/llm_client.py
import os
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("uvicorn")

class VertexAIClient:
    def __init__(self):
        # Initialize the new Gen AI Client
        # ensure GOOGLE_API_KEY is set in your .env file
        self.client = genai.Client(
            api_key=os.getenv("GOOGLE_API_KEY"),
            http_options=types.HttpOptions(api_version="v1")
        )

    def chat_completion(
        self, messages: list[dict], model: str = "gemini-2.0-flash-exp", **kwargs
    ) -> str:
        """
        Handles chat completion with manual prompt construction for System/User/Assistant roles.
        Supports multimodal input (Text + Images).
        """
        try:
            combined_contents = []
            current_text_chunk = ""

            for msg in messages:
                role_label = msg["role"].capitalize()  # "System", "User", "Assistant"
                content = msg["content"]

                # Add Role Label to text buffer
                current_text_chunk += f"{role_label}: "

                if isinstance(content, str):
                    current_text_chunk += f"{content}\n\n"

                elif isinstance(content, list):
                    # Handle Multimodal List
                    for part in content:
                        if isinstance(part, str):
                            current_text_chunk += f"{part}\n"
                        elif hasattr(part, 'inline_data') or hasattr(part, 'file_data'):
                            # If we hit an image part, flush the text buffer first
                            if current_text_chunk:
                                combined_contents.append(current_text_chunk)
                                current_text_chunk = "" # Reset buffer
                            
                            # Add the image part directly
                            combined_contents.append(part)

                    current_text_chunk += "\n\n"

            # Append remaining text
            if current_text_chunk:
                combined_contents.append(current_text_chunk)

            # Call the model
            # Note: I changed default model to 'gemini-2.0-flash-exp' as 2.5 is not public yet.
            # Change back to 'gemini-2.5-flash' if you have early access.
            response = self.client.models.generate_content(
                model=model,
                contents=combined_contents,
                config=types.GenerateContentConfig(
                    temperature=kwargs.get("temperature", 0.7)
                )
            )
            return response.text

        except Exception as err:
            logger.exception(f"Error in VertexAIClient.chat_completion: {err}")
            return "Error generating response."

    def execute_code(self, text_prompt: str) -> str:
        """
        Executes code using the Gemini Code Execution tool.
        """
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=text_prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(code_execution=types.ToolCodeExecution)],
                    temperature=0,
                ),
            )
            return response.text
        except Exception as err:
            logger.exception(f"Error in execute_code: {err}")
            return "Error executing code."
    
    def embed_text(self, text: str, model: str = "text-embedding-004") -> list[float]:
        """
        Converts text into a vector embedding.
        """
        try:
            # The new SDK syntax for embeddings
            response = self.client.models.embed_content(
                model=model,
                contents=text,
            )
            return response.embeddings[0].values
        except Exception as err:
            logger.exception(f"Error generating embedding: {err}")
            return []