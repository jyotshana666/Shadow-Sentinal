# Shadow Sentinel ML - Risk Assessment Module

## 1. Objective
The Risk Assessment module evaluates session telemetry, classification output, and enterprise governance policies to determine session risk level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and generate explainable reasons.

## 2. Decoupling from Classification
Risk is strictly separated from Classification:
* **Classification** answers: *"What activity occurred?"*
* **Risk Assessment** answers: *"What does this activity mean under applicable governance policy and context?"*

## 3. Architecture & SOLID Principles
* `RiskContext` (`ML/Risk/context.py`): Encapsulates session data, classification results, and active policies.
* `BaseRiskRule` (`ML/Risk/rules.py`): Abstract Base Class enforcing Open/Closed principle for risk rules:
  * `DomainPolicyRule`: Flags known AI domains.
  * `GenerationActivityRule`: Flags active streaming/generation.
  * `InteractionVolumeRule`: Flags high user interaction volume (>15 interactions).
  * `ConfiguredPolicyRule`: Evaluates custom enterprise policies configured in Backend database.
* `RiskEvaluator` (`ML/Risk/evaluator.py`): Aggregates rules, computes max risk rank, and generates explainable evidence-backed reasons.
* `RiskService` (`ML/Risk/service.py`): Service boundary exposing risk processing with exception protection.

## 4. Risk Levels & Explainability
Risk levels match Spring Boot Backend enum definitions:
* `LOW` (Normal web session)
* `MEDIUM` (Visited known AI domain)
* `HIGH` (Active content generation / SSE stream / high interaction)
* `CRITICAL` (Custom policy block rule violation)

Every non-LOW risk returns explicit, evidence-backed explanations (e.g. `"Active AI content generation / SSE stream detected"`).
