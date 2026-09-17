"""
Risk Service Boundary for Shadow Sentinel ML Module.
Exposes process_risk_assessment with safe error handling.
"""

from typing import Dict, Any, List
import logging
from ML.Risk.context import RiskContext
from ML.Risk.evaluator import RiskEvaluator

logger = logging.getLogger("ShadowSentinel.ML.Risk")

class RiskService:
    """Service boundary for risk evaluation with error protection."""

    def __init__(self, evaluator: RiskEvaluator = None):
        self.evaluator = evaluator or RiskEvaluator()

    def process_risk_assessment(self, session: Dict[str, Any], classification: Dict[str, Any], policies: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Evaluates risk for session telemetry and classification.
        Safely catches exceptions and returns controlled risk state.
        """
        try:
            context = RiskContext(session=session, classification=classification, policies=policies)
            return self.evaluator.evaluate_risk(context)
        except Exception as ex:
            logger.error("Error during ML risk assessment: %s", ex, exc_info=True)
            return {
                "riskLevel": "LOW",
                "reasons": ["Risk evaluation encountered system fallback."],
                "riskScore": 10.0
            }
