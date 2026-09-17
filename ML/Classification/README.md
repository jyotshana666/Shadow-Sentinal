# Shadow Sentinel ML - Classification Module

## 1. Objective
The Classification module transforms raw browser telemetry evidence (`ClassificationEvidence`) into site classification decisions (`ClassificationResult`). It determines site AI capability, interaction evidence, active content generation, and confidence score.

## 2. Input Features & Feature Engineering
Input telemetry is processed by `FeatureExtractor` (`ML/Classification/feature_extractor.py`) into normalized features:
* `is_known_ai_domain`: Binary indicator (1 if domain matches known AI catalog).
* `has_chat_input`: Binary flag indicating presence of text/chat input DOM element.
* `has_streaming_div`: Binary flag indicating presence of live streaming response container.
* `has_ai_title` / `has_ai_meta`: Binary indicators for AI keywords in page title or meta tags.
* `detected_classes_count`: Number of AI-specific CSS classes detected on page.
* `form_interaction_rate`: Rate of user form interactions.
* `ai_confidence_score`: Raw edge heuristic score.
* `request_count` / `request_frequency` / `rapid_request_burst`: Network request burst metrics.
* `sse_detected` / `total_sse_events`: Server-Sent Events (SSE) streaming count.
* `interaction_count`: Total user click/submit events.

## 3. Hybrid Classifier Architecture
Classification is implemented via `HybridClassifier` (`ML/Classification/classifier.py`) which implements `BaseClassifier` (Interface):
* **Evidence Rules:** Evaluates DOM signals and network streaming (SSE / burst).
* **Feature Score Weighting:** Evaluates weighted sum of detected signals.
* **Output Schema:**
  * `siteType`: `ai_website`, `ai_capable_website`, `non_ai_website`, `monitored_website`
  * `aiCapability`: `ai_capable`, `non_ai_capable`
  * `generationActive`: `True` / `False` (true if SSE or rapid burst or high interaction)
  * `siteCategory`: `ai_tool`, `education_learning`, `developer_tool`, `ecommerce`, `social_media`, `unknown`
  * `confidenceScore`: Calibrated score (0.0 to 100.0)
  * `classifiedBy`: Model version identifier (`ML_HYBRID_MODEL_CLASSIFICATION-MODEL-V1`)

## 4. Model Versioning & Artifacts
* Model version: `classification-model-v1`
* Serialized configuration: `ML/artifacts/classification_model_v1.json`
* Artifact generator: `python ML/train.py`

## 5. Fallback Behavior
If error occurs in classification pipeline, `ClassificationService` (`ML/Classification/service.py`) returns safe default state (`monitored_website`, `non_ai_capable`, `generationActive=False`, `classifiedBy="FALLBACK_HEURISTIC_RULES"`).
