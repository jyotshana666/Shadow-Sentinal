"""
Feature Extractor for Shadow Sentinel ML Classification Module.
Responsibility: Transforms raw ClassificationEvidence payloads into structured, deterministic feature dictionaries.
"""

from typing import Dict, Any, List

KNOWN_AI_DOMAINS = {
    "chat.openai.com", "chatgpt.com", "claude.ai", "gemini.google.com",
    "copilot.microsoft.com", "bard.google.com", "huggingface.co", "poe.com",
    "perplexity.ai", "character.ai", "you.com", "mistral.ai", "groq.com",
    "cohere.com", "together.ai", "replicate.com", "stability.ai",
    "midjourney.com", "leonardo.ai", "runwayml.com", "playground.ai"
}

CATEGORY_MAP = {
    "github.com": "developer_tool",
    "gitlab.com": "developer_tool",
    "stackoverflow.com": "developer_tool",
    "amazon.com": "ecommerce",
    "flipkart.com": "ecommerce",
    "linkedin.com": "social_media",
    "twitter.com": "social_media",
    "x.com": "social_media"
}

class FeatureExtractor:
    """Deterministic feature extractor from browser telemetry evidence."""

    def extract_features(self, evidence: Dict[str, Any], session_meta: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Extracts structured feature vector from evidence payload.
        Handles missing fields defensively.
        """
        if evidence is None:
            evidence = {}
        if session_meta is None:
            session_meta = {}

        domain = (evidence.get("domain") or session_meta.get("domain") or "").lower()
        is_known_ai = 1 if domain in KNOWN_AI_DOMAINS else 0

        has_chat_input = 1 if evidence.get("hasChatInput") else 0
        has_streaming_div = 1 if evidence.get("hasStreamingDiv") else 0
        has_ai_title = 1 if evidence.get("hasAiTermsInTitle") else 0
        has_ai_meta = 1 if evidence.get("hasAiTermsInMeta") else 0

        detected_classes = evidence.get("detectedAiClasses") or []
        detected_classes_count = len(detected_classes) if isinstance(detected_classes, list) else 0

        form_rate = float(evidence.get("formInteractionRate") or 0.0)
        ai_score = float(evidence.get("aiConfidenceScore") or 0.0)

        request_count = int(evidence.get("requestCount") or session_meta.get("requestCount") or 0)
        request_freq = float(evidence.get("requestFrequency") or session_meta.get("requestFrequency") or 0.0)
        rapid_burst = 1 if (evidence.get("rapidRequestBurst") or session_meta.get("rapidRequestBurst")) else 0
        sse_detected = 1 if (evidence.get("sseDetected") or session_meta.get("sseDetected")) else 0
        total_sse = int(evidence.get("totalSseEvents") or session_meta.get("totalSseEvents") or 0)
        interaction_count = int(evidence.get("interactionCount") or session_meta.get("interactionCount") or 0)

        site_category = "unknown"
        if is_known_ai:
            site_category = "ai_tool"
        elif domain in CATEGORY_MAP:
            site_category = CATEGORY_MAP[domain]
        elif has_ai_title:
            site_category = "education_learning"

        return {
            "domain": domain,
            "is_known_ai_domain": is_known_ai,
            "has_chat_input": has_chat_input,
            "has_streaming_div": has_streaming_div,
            "has_ai_title": has_ai_title,
            "has_ai_meta": has_ai_meta,
            "detected_classes_count": detected_classes_count,
            "form_interaction_rate": form_rate,
            "ai_confidence_score": ai_score,
            "request_count": request_count,
            "request_frequency": request_freq,
            "rapid_request_burst": rapid_burst,
            "sse_detected": sse_detected,
            "total_sse_events": total_sse,
            "interaction_count": interaction_count,
            "site_category": site_category
        }
