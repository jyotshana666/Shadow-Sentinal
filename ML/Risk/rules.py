"""
Risk Rules for Shadow Sentinel Risk Evaluation Engine.
Each rule evaluates a specific risk factor and returns a tuple (risk_level, reason).
"""

from abc import ABC, abstractmethod
from typing import Optional, Tuple, List
import re
from ML.Risk.context import RiskContext

RISK_RANKS = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1}

class BaseRiskRule(ABC):
    """Abstract base class for policy-driven risk rules (Open/Closed Principle)."""

    @abstractmethod
    def evaluate(self, context: RiskContext) -> Optional[Tuple[str, str]]:
        """
        Evaluates context and returns (risk_level, reason_string) if rule triggers,
        or None if rule does not apply.
        """
        pass

class DomainPolicyRule(BaseRiskRule):
    """Evaluates whether domain is a known AI service."""

    def evaluate(self, context: RiskContext) -> Optional[Tuple[str, str]]:
        if context.site_type == "ai_website":
            return ("MEDIUM", f"Visited known AI domain: {context.domain}")
        return None

class GenerationActivityRule(BaseRiskRule):
    """Evaluates active content generation / SSE stream indicators."""

    def evaluate(self, context: RiskContext) -> Optional[Tuple[str, str]]:
        if context.generation_active or context.sse_detected:
            return ("HIGH", "Active AI content generation / SSE stream detected")
        return None

class InteractionVolumeRule(BaseRiskRule):
    """Evaluates high-volume user interaction with AI functionality."""

    def evaluate(self, context: RiskContext) -> Optional[Tuple[str, str]]:
        if context.interaction_count > 15:
            return ("HIGH", f"High volume user interaction with AI interface ({context.interaction_count} interactions)")
        return None

class ConfiguredPolicyRule(BaseRiskRule):
    """Evaluates custom enterprise policies configured in Backend database."""

    def evaluate(self, context: RiskContext) -> Optional[Tuple[str, str]]:
        highest_risk = None
        reasons = []

        for policy in context.policies:
            if not policy.get("enabled", True):
                continue
            pattern = policy.get("domainPattern", "*")
            if self._matches_domain(context.domain, pattern):
                policy_risk = policy.get("minRiskLevel", "MEDIUM").upper()
                action = policy.get("action", "ALERT")
                name = policy.get("name", "Policy Rule")
                reasons.append(f"Triggered policy '{name}' (Action: {action})")

                if highest_risk is None or RISK_RANKS.get(policy_risk, 1) > RISK_RANKS.get(highest_risk, 1):
                    highest_risk = policy_risk

        if highest_risk and reasons:
            return (highest_risk, "; ".join(reasons))
        return None

    @staticmethod
    def _matches_domain(domain: str, pattern: str) -> bool:
        if pattern == "*":
            return True
        regex = pattern.replace(".", r"\.").replace("*", ".*")
        return bool(re.match(f"(?i)^{regex}$", domain))
