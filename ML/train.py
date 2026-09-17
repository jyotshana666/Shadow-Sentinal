"""
Model Training & Artifact Serialization Script for Shadow Sentinel ML Module.
Artifact Version: classification-model-v1
Note: No real labeled user evaluation dataset currently exists in the repository.
This script demonstrates feature engineering, rule-weight calibration, and model artifact export.
"""

import json
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ML.Classification.feature_extractor import FeatureExtractor

def train_and_export_model():
    """Builds and serializes classification-model-v1 artifact."""
    artifact_dir = os.path.join(os.path.dirname(__file__), "artifacts")
    os.makedirs(artifact_dir, exist_ok=True)
    artifact_path = os.path.join(artifact_dir, "classification_model_v1.json")

    model_metadata = {
        "version": "classification-model-v1",
        "description": "Hybrid Evidence & Feature Weight Model for AI Site Classification",
        "trained_date": "2026-09-17",
        "dataset_status": "NOT AVAILABLE — Built using baseline feature schemas; real evaluation requires labeled dataset",
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

    with open(artifact_path, "w", encoding="utf-8") as f:
        json.dump(model_metadata, f, indent=2)

    print(f"[ShadowSentinel ML] Artifact exported successfully to: {artifact_path}")

if __name__ == "__main__":
    train_and_export_model()
