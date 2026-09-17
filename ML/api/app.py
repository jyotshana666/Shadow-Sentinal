"""
FastAPI Microservice Application for Shadow Sentinel ML Module.
Exposes REST endpoints for Classification and Risk Evaluation.
"""

from fastapi import FastAPI, HTTPException
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ML.Classification.service import ClassificationService
from ML.Risk.service import RiskService
from ML.api.schemas import (
    ClassificationRequest,
    ClassificationResponse,
    RiskAssessmentRequest,
    RiskAssessmentResponse
)

app = FastAPI(
    title="Shadow Sentinel ML Service",
    description="Microservice for ML Site Classification & Risk Evaluation",
    version="1.0.0"
)

classification_service = ClassificationService()
risk_service = RiskService()

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "shadow-sentinel-ml-service",
        "model_version": classification_service.classifier.get_version()
    }

@app.post("/api/v1/ml/classify", response_model=ClassificationResponse)
def classify_session(req: ClassificationRequest):
    try:
        result = classification_service.process_classification(req.evidence, req.session)
        return ClassificationResponse(**result)
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@app.post("/api/v1/ml/assess-risk", response_model=RiskAssessmentResponse)
def assess_risk(req: RiskAssessmentRequest):
    try:
        result = risk_service.process_risk_assessment(req.session, req.classification, req.policies)
        return RiskAssessmentResponse(**result)
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
