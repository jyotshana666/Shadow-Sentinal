"""
Unit tests for FeatureExtractor.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ML.Classification.feature_extractor import FeatureExtractor

class TestFeatureExtractor(unittest.TestCase):

    def setUp(self):
        self.extractor = FeatureExtractor()

    def test_known_ai_domain_feature(self):
        evidence = {"domain": "chatgpt.com", "hasChatInput": True}
        features = self.extractor.extract_features(evidence)
        self.assertEqual(features["is_known_ai_domain"], 1)
        self.assertEqual(features["has_chat_input"], 1)
        self.assertEqual(features["site_category"], "ai_tool")

    def test_non_ai_domain_feature(self):
        evidence = {"domain": "github.com", "hasChatInput": False}
        features = self.extractor.extract_features(evidence)
        self.assertEqual(features["is_known_ai_domain"], 0)
        self.assertEqual(features["site_category"], "developer_tool")

    def test_missing_evidence_fields_handled_safely(self):
        features = self.extractor.extract_features(None, None)
        self.assertEqual(features["domain"], "")
        self.assertEqual(features["is_known_ai_domain"], 0)
        self.assertEqual(features["interaction_count"], 0)

if __name__ == "__main__":
    unittest.main()
