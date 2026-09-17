# Shadow Sentinel - ML Module (Classification & Risk)

## 1. Overview
The ML module provides intelligent site classification and contextual risk assessment for the Shadow Sentinel enterprise AI governance platform. It consists of a Python microservice / feature pipeline and adapter clients embedded in the Spring Boot Backend.

## 2. Microservice Architecture
`Spring Boot Backend (MlClassificationServiceImpl / MlRiskServiceImpl) ↓ REST HTTP API (http://localhost:5000) ↓ FastAPI Microservice (ML/api/app.py) ↓ FeatureExtractor & HybridClassifier (classification-model-v1) ↓ RiskEvaluator & Policy Rules ↓ ClassificationResult & RiskAssessment Response`

## 3. Classification Pipeline
* **Objective:** Determine if a browser session involves an AI-capable site, active content generation, or high-confidence AI usage.
* **Input Features:** `is_known_ai_domain`, `has_chat_input`, `has_streaming_div`, `has_ai_title`, `has_ai_meta`, `detected_classes_count`, `form_interaction_rate`, `ai_confidence_score`, `request_count`, `request_frequency`, `rapid_request_burst`, `sse_detected`, `total_sse_events`, `interaction_count`.
* **Model Version:** `classification-model-v1`
* **Artifact Location:** `ML/artifacts/classification_model_v1.json`

## 4. Risk Evaluation Engine
* **Objective:** Assess policy risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with explainable evidence-backed reasons.
* **Architecture:** Strategy/Rule pattern using `BaseRiskRule`, `DomainPolicyRule`, `GenerationActivityRule`, `InteractionVolumeRule`, and `ConfiguredPolicyRule`.

## 5. Backend Integration & Graceful Fallback
The Java Spring Boot backend interfaces with this ML microservice via `@Primary` bean implementations `MlClassificationServiceImpl` and `MlRiskServiceImpl`.
* **Graceful Fallback:** If the Python ML microservice is offline or unreachable, the Java Backend automatically catches connection errors and seamlessly falls back to local Java heuristic/policy rule implementations.

## 6. How to Run ML Microservice & Tests

### Training & Artifact Export:
```bash
python ML/train.py
```

### Running Automated Test Suite:
```bash
python ML/tests/run_tests.py
```

### Starting FastAPI Microservice:
```bash
python -m pip install -r ML/requirements.txt
python ML/api/app.py
```
Microservice will listen on `http://localhost:5000` with interactive OpenAPI documentation at `http://localhost:5000/docs`.

## 7. Model Evaluation & Dataset Status
**Dataset Status:** `NOT AVAILABLE — No legitimate labeled user evaluation dataset in repository`.
Model features and classification thresholds were built and validated using baseline evidentiary rules and synthetic seed schemas. Real model precision/recall/F1 metrics require a future labeled corporate web browsing telemetry dataset.
