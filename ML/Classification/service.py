"""
Classification Service Orchestrator for Shadow Sentinel ML Module.
Orchestrates FeatureExtractor and HybridClassifier with safe fallback error handling.
"""

from typing import Dict, Any
import logging
from ML.Classification.feature_extractor import FeatureExtractor
from ML.Classification.classifier import HybridClassifier, BaseClassifier

logger = logging.getLogger("ShadowSentinel.ML.Classification")

class ClassificationService:
    """Orchestrates classification with safe fallback capabilities."""

    def __init__(self, classifier: BaseClassifier = None):
        self.feature_extractor = FeatureExtractor()
        self.classifier = classifier or HybridClassifier()

    def process_classification(self, evidence: Dict[str, Any], session_meta: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Processes classification for input evidence.
        Includes graceful fallback if processing encounters an error.
        """
        try:
            features = self.feature_extractor.extract_features(evidence, session_meta)
            return self.classifier.classify(features)
        except Exception as ex:
            logger.error("Error during ML classification processing: %s", ex, exc_info=True)
            # Safe Fallback to baseline default response
            return {
                "siteType": "monitored_website",
                "aiCapability": "non_ai_capable",
                "generationActive": False,
                "siteCategory": "unknown",
                "confidenceScore": 10.0,
                "classifiedBy": "FALLBACK_HEURISTIC_RULES"
            }
