"""
RiskContext DTO for Shadow Sentinel ML Risk Assessment Engine.
Encapsulates session telemetry, classification output, active policies, and context.
"""

from typing import Dict, Any, List

class RiskContext:
    """Encapsulates context required for policy-driven risk evaluation."""

    def __init__(self, session: Dict[str, Any], classification: Dict[str, Any], policies: List[Dict[str, Any]] = None):
        self.session = session or {}
        self.classification = classification or {}
        self.policies = policies or []

        self.domain = (self.session.get("domain") or "").lower()
        self.site_type = self.classification.get("siteType") or "monitored_website"
        self.generation_active = bool(self.classification.get("generationActive"))
        self.interaction_count = int(self.session.get("interactionCount") or 0)
        self.sse_detected = bool(self.session.get("sseDetected"))
