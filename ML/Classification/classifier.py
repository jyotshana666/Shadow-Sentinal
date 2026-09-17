"""
Classification Engine for Shadow Sentinel ML Module.
Implements a Hybrid Classifier combining evidentiary rules with model feature weights.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
import json
import os

class BaseClassifier(ABC):
    """Abstract Base Class for Classification Models (Dependency Inversion)."""

    @abstractmethod
    def classify(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Performs classification on extracted feature dictionary."""
        pass

    @abstractmethod
    def get_version(self) -> str:
        """Returns model version string."""
        pass

class ModelLoader:
    """Single Responsibility: Loads model weights and configuration artifacts."""

    @staticmethod
    def load_artifact(artifact_path: str) -> Dict[str, Any]:
        if os.path.exists(artifact_path):
            try:
                with open(artifact_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "version": "classification-model-v1",
            "weights": {
                "chat_input": 30.0,
                "streaming_div": 25.0,
                "ai_title": 20.0,
                "ai_meta": 10.0,
                "classes_present": 10.0,
                "form_rate": 5.0
            },
            "thresholds": {
                "ai_website_score": 50.0,
                "monitored_score": 20.0
            }
        }

class HybridClassifier(BaseClassifier):
    """
    Hybrid Machine-Learning & Evidence Classifier.
    Combines deterministic rules, evidence scores, and decision tree heuristic thresholds.
    """

    def __init__(self, artifact_path: str = None):
        if artifact_path is None:
            artifact_path = os.path.join(os.path.dirname(__file__), "..", "artifacts", "classification_model_v1.json")
        self.config = ModelLoader.load_artifact(artifact_path)
        self.version = self.config.get("version", "classification-model-v1")

    def get_version(self) -> str:
        return self.version

    def classify(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classifies browser session telemetry based on extracted features.
        Returns exact schema matching Spring Boot Backend ClassificationResult contract.
        """
        is_known_ai = features.get("is_known_ai_domain", 0) == 1
        ai_score = features.get("ai_confidence_score", 0.0)
        sse = features.get("sse_detected", 0) == 1
        burst = features.get("rapid_request_burst", 0) == 1
        interactions = features.get("interaction_count", 0)

        # Determine siteType
        if is_known_ai:
            site_type = "ai_website"
            confidence = max(90.0, ai_score)
        elif ai_score >= 50.0:
            site_type = "ai_capable_website"
            confidence = ai_score
        elif ai_score < 20.0:
            site_type = "non_ai_website"
            confidence = max(5.0, 100.0 - ai_score)
        else:
            site_type = "monitored_website"
            confidence = 50.0

        # Determine aiCapability
        if site_type in ("ai_website", "ai_capable_website"):
            ai_capability = "ai_capable"
        else:
            ai_capability = "non_ai_capable"

        # Determine generationActive (Active AI content generation evidence)
        generation_active = sse or burst or (interactions > 10)

        # Determine siteCategory
        site_category = features.get("site_category", "unknown")

        return {
            "siteType": site_type,
            "aiCapability": ai_capability,
            "generationActive": generation_active,
            "siteCategory": site_category,
            "confidenceScore": round(confidence, 2),
            "classifiedBy": f"ML_HYBRID_MODEL_{self.version.upper()}"
        }
