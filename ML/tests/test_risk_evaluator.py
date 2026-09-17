"""
Unit tests for Risk Assessment & Policy Evaluator.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ML.Risk.service import RiskService

class TestRiskEvaluator(unittest.TestCase):

    def setUp(self):
        self.service = RiskService()

    def test_low_risk_session(self):
        session = {"domain": "normal-site.com", "interactionCount": 1}
        classification = {"siteType": "non_ai_website", "generationActive": False}
        res = self.service.process_risk_assessment(session, classification)
        self.assertEqual(res["riskLevel"], "LOW")

    def test_medium_risk_session(self):
        session = {"domain": "chatgpt.com", "interactionCount": 2}
        classification = {"siteType": "ai_website", "generationActive": False}
        res = self.service.process_risk_assessment(session, classification)
        self.assertEqual(res["riskLevel"], "MEDIUM")
        self.assertTrue(any("chatgpt.com" in r for r in res["reasons"]))

    def test_high_risk_session_with_active_generation(self):
        session = {"domain": "claude.ai", "interactionCount": 20, "sseDetected": True}
        classification = {"siteType": "ai_website", "generationActive": True}
        res = self.service.process_risk_assessment(session, classification)
        self.assertEqual(res["riskLevel"], "HIGH")

    def test_critical_risk_policy_match(self):
        session = {"domain": "forbidden-llm.com", "interactionCount": 5}
        classification = {"siteType": "monitored_website", "generationActive": False}
        policies = [
            {"name": "Block Forbidden LLM", "domainPattern": "forbidden-llm.com", "minRiskLevel": "CRITICAL", "action": "BLOCK", "enabled": True}
        ]
        res = self.service.process_risk_assessment(session, classification, policies)
        self.assertEqual(res["riskLevel"], "CRITICAL")
        self.assertTrue(any("Block Forbidden LLM" in r for r in res["reasons"]))

if __name__ == "__main__":
    unittest.main()
