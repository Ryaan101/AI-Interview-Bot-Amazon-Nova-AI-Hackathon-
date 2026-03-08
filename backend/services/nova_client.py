# backend/services/nova_client.py

import os
import boto3

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
NOVA_MODEL_ID = os.getenv("NOVA_MODEL_ID", "amazon.nova-lite-v1:0")


class NovaClient:
    def __init__(self):
        self.client = boto3.client("bedrock-runtime", region_name=AWS_REGION)
        self.model_id = NOVA_MODEL_ID

    def converse(self, system_text: str, user_text: str = None, messages: list = None) -> str:
        """
        Uses Bedrock 'converse' API.
        Accepts either a simple user_text (single-turn) or a full messages list (multi-turn).
        Returns assistant text.
        """
        if messages is None:
            messages = [{"role": "user", "content": [{"text": user_text}]}]

        if hasattr(self.client, "converse"):
            resp = self.client.converse(
                modelId=self.model_id,
                system=[{"text": system_text}],
                messages=messages,
            )
            return resp["output"]["message"]["content"][0]["text"]

        # Fallback (older SDKs): invoke_model
        import json

        body = {
            "system": [{"text": system_text}],
            "messages": messages,
        }

        resp = self.client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body),
        )

        payload = json.loads(resp["body"].read())
        return payload["output"]["message"]["content"][0]["text"]