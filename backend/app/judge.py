import json
import logging
from app.llm_client import VertexAIClient
from app.PROMPTS import SYS_PROMPT

logger = logging.getLogger("uvicorn")

class TeleoJudge:
    def __init__(self):
        self.ai = VertexAIClient()

    def evaluate_submission(self, job_desc: str, code: str, language: str) -> dict:
        """
        Uses Gemini to statically analyze code against requirements.
        Returns: {'verdict': 'PASS' | 'FAIL', 'reason': 'str'}
        """
        
        system_prompt = SYS_PROMPT.strip()

        user_content = f"""
        --- JOB REQUIREMENTS ---
        {job_desc}

        --- SUBMITTED CODE ({language}) ---
        {code}
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        try:
            response_text = self.ai.chat_completion(messages, model="gemini-2.0-flash-exp")
            
            cleaned_text = response_text.replace("```json", "").replace("```", "").strip()
            
            result = json.loads(cleaned_text)
            
            # Fallback validation
            if result.get("verdict") not in ["PASS", "FAIL"]:
                result["verdict"] = "FAIL"
                result["reason"] = "AI Error: Invalid verdict format."
                
            return result

        except json.JSONDecodeError:
            logger.error(f"JSON Decode Error. Raw AI Output: {response_text}")
            return {"verdict": "FAIL", "reason": "System Error: AI response was not valid JSON."}
        except Exception as e:
            logger.error(f"Judge Error: {e}")
            return {"verdict": "FAIL", "reason": f"System Error: {str(e)}"}