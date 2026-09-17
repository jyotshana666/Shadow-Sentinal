"""
Risk Evaluator Orchestrator for Shadow Sentinel ML Risk Module.
Aggregates focused risk rules, resolves highest risk rank, and builds explainable reasons.
"""

from typing import List, Dict, Any
from ML.Risk.context import RiskContext
from ML.Risk.rules import (
    BaseRiskRule,
    DomainPolicyRule,
    GenerationActivityRule,
    InteractionVolumeRule,
    ConfiguredPolicyRule,
    RISK_RANKS
)

class RiskEvaluator:
    """Orchestrates risk rule evaluation (Single Responsibility / Strategy Pattern)."""

    def __init__(self, rules: List[BaseRiskRule] = None):
        self.rules = rules or [
            DomainPolicyRule(),
            GenerationActivityRule(),
            InteractionVolumeRule(),
            ConfiguredPolicyRule()
        ]

    def evaluate_risk(self, context: RiskContext) -> Dict[str, Any]:
        """
        Evaluates context across all rules.
        Returns dictionary matching Backend RiskAssessment schema.
        """
        current_risk_level = "LOW"
        reasons: List[str] = []

        for rule in self.rules:
            result = rule.evaluate(context)
            if result:
                level, reason = result
                reasons.append(reason)
                if RISK_RANKS.get(level, 1) > RISK_RANKS.get(current_risk_level, 1):
                    current_risk_level = level

        if not reasons:
            reasons.append("Standard web session telemetry; no governance policy violations.")

        # Compute internal numerical risk score (0.0 - 100.0)
        risk_score_map = {"LOW": 15.0, "MEDIUM": 45.0, "HIGH": 75.0, "CRITICAL": 95.0}
        numerical_score = risk_score_map.get(current_risk_level, 10.0)

        return {
            "riskLevel": current_risk_level,
            "reasons": reasons,
            "riskScore": numerical_score
        }
