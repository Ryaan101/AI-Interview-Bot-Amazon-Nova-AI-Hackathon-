# backend/services/nova_client.py

import os
import boto3

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL_ID = os.getenv("NOVA_MODEL_ID", "amazon.nova-lite-v1:0")


class NovaClient:
    def __init__(self):
        self.client = boto3.client("bedrock-runtime", region_name=AWS_REGION)
        self.model_id = NOVA_MODEL_ID

    def converse(self, system_text: str, user_text: str) -> str:
        """
        Uses Bedrock 'converse' API when available (best), with a safe fallback.
        Returns assistant text.
        """
        # Preferred: Converse API
        if hasattr(self.client, "converse"):
            resp = self.client.converse(
                modelId=self.model_id,
                system=[{"text": system_text}],
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": user_text}],
                    }
                ],
            )

            # Typical Bedrock converse response shape:
            # resp["output"]["message"]["content"][0]["text"]
            return resp["output"]["message"]["content"][0]["text"]

        # Fallback (older SDKs): invoke_model (kept here for safety)
        import json

        body = {
            "system": [{"text": system_text}],
            "messages": [
                {"role": "user", "content": [{"text": user_text}]}
            ],
        }

        resp = self.client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body),
        )

        payload = json.loads(resp["body"].read())
        return payload["output"]["message"]["content"][0]["text"]