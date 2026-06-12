from abc import ABC, abstractmethod
from typing import Any

import httpx

from app.config import settings


class AiProvider(ABC):
    @abstractmethod
    async def vision_analyze(self, payload: dict[str, Any]) -> dict[str, Any]:
        ...

    @abstractmethod
    async def audio_analyze(self, payload: dict[str, Any]) -> dict[str, Any]:
        ...

    @abstractmethod
    async def video_create_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        ...

    @abstractmethod
    async def health_assessment(self, payload: dict[str, Any]) -> dict[str, Any]:
        ...

    @abstractmethod
    async def chat(self, payload: dict[str, Any], sku: str) -> dict[str, Any]:
        ...


class MockProvider(AiProvider):
    async def vision_analyze(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not payload.get("image_url") and not payload.get("image_base64"):
            raise ValueError("missing_image")
        return {
            "task_type": payload.get("task_type", "breed"),
            "results": [
                {"breed": "Golden Retriever", "breed_cn": "金毛寻回犬", "confidence": 0.91}
            ],
            "pet_detected": True,
            "disclaimer": "本结果仅供参考，不能替代兽医诊断。",
        }

    async def audio_analyze(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not payload.get("audio_url") and not payload.get("audio_base64"):
            raise ValueError("missing_audio")
        return {
            "task_type": payload.get("task_type", "bark"),
            "events": [{"label": "bark_alert", "start_sec": 1.2, "end_sec": 1.8, "confidence": 0.84}],
            "summary": "检测到短促吠叫，倾向警戒。",
            "disclaimer": "本结果仅供参考，不能替代兽医诊断。",
        }

    async def video_create_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not payload.get("video_url"):
            raise ValueError("missing_video")
        duration = float(payload.get("duration_sec") or 12.5)
        return {
            "task_id": "tsk_mock_001",
            "status": "completed",
            "pet_type": payload.get("pet_type", "dog"),
            "duration_sec": duration,
            "behaviors": [
                {"label": "playing", "confidence": 0.87, "time_range": [2.1, 8.4]},
            ],
            "summary": "视频中犬只以玩耍行为为主。",
            "disclaimer": "本结果仅供参考，不能替代兽医诊断。",
        }

    async def health_assessment(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not payload.get("pet_profile") or not payload.get("symptoms"):
            raise ValueError("missing_questionnaire")
        return {
            "report_id": "rpt_mock_001",
            "risk_level": "medium",
            "focus_areas": ["digestive"],
            "summary": "存在中等程度消化不适倾向，建议观察或咨询兽医。",
            "suggestions": ["清淡饮食 24h", "如呕吐持续请就医"],
            "disclaimer": "本报告为 AI 健康倾向评估，不是兽医诊断或处方。",
        }

    async def chat(self, payload: dict[str, Any], sku: str) -> dict[str, Any]:
        messages = payload.get("messages") or []
        if not messages:
            raise ValueError("missing_messages")
        last = messages[-1].get("content", "")
        if sku == "T02":
            reply = f"【问诊模式】已了解：{last[:80]}… 建议先观察 24 小时，若加重请就医。"
        else:
            reply = f"【通用模式】关于「{last[:80]}」，建议保持规律作息与均衡饮食。"
        tokens = max(len(reply) // 4, 100)
        return {
            "message": {"role": "assistant", "content": reply},
            "usage": {"total_tokens": tokens},
            "disclaimer": "本结果仅供参考，不能替代兽医诊断。",
        }


class HttpProvider(AiProvider):
    """Reserved: forward to internal inference gateway when env is configured."""

    def __init__(self) -> None:
        self.base = settings.ai_http_base_url.rstrip("/")
        self.api_key = settings.ai_http_api_key

    async def _post(self, path: str, payload: dict) -> dict:
        if not self.base:
            raise RuntimeError("AI_HTTP_BASE_URL not configured")
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(f"{self.base}{path}", json=payload, headers=headers)
            r.raise_for_status()
            return r.json()

    async def vision_analyze(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/vision/analyze", payload)

    async def audio_analyze(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/audio/analyze", payload)

    async def video_create_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/video/behavior/tasks", payload)

    async def health_assessment(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/health/assessment", payload)

    async def chat(self, payload: dict[str, Any], sku: str) -> dict[str, Any]:
        return await self._post(f"/chat/{sku}", payload)


def get_provider() -> AiProvider:
    if settings.ai_provider == "http":
        return HttpProvider()
    return MockProvider()
