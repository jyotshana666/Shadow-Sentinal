"""
Unit tests for Classification Service & Hybrid Classifier.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ML.Classification.service import ClassificationService
from ML.Classification.classifier import HybridClassifier

class TestClassification(unittest.TestCase):

    def setUp(self):
        self.service = ClassificationService()

    def test_classify_known_ai_domain(self):
        evidence = {
            "domain": "chat.openai.com",
            "hasChatInput": True,
            "sseDetected": True,
            "aiConfidenceScore": 85.0
        }
        res = self.service.process_classification(evidence)
        self.assertEqual(res["siteType"], "ai_website")
        self.assertEqual(res["aiCapability"], "ai_capable")
        self.assertTrue(res["generationActive"])
        self.assertTrue("ML_HYBRID_MODEL" in res["classifiedBy"])

    def test_classify_non_ai_domain(self):
        evidence = {
            "domain": "example.org",
            "hasChatInput": False,
            "aiConfidenceScore": 5.0
        }
        res = self.service.process_classification(evidence)
        self.assertEqual(res["siteType"], "non_ai_website")
        self.assertEqual(res["aiCapability"], "non_ai_capable")
        self.assertFalse(res["generationActive"])

    def test_classification_fallback_on_exception(self):
        # Pass completely invalid object to force fallback exception
        class BadObject:
            def get(self, *args):
                raise RuntimeError("Simulated Pipeline Error")

        res = self.service.process_classification(BadObject())
        self.assertEqual(res["classifiedBy"], "FALLBACK_HEURISTIC_RULES")
        self.assertEqual(res["siteType"], "monitored_website")

if __name__ == "__main__":
    unittest.main()
