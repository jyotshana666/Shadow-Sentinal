"""
Pydantic Schemas for Shadow Sentinel ML Microservice REST API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ClassificationRequest(BaseModel):
    evidence: Dict[str, Any] = Field(default_factory=dict)
    session: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ClassificationResponse(BaseModel):
    siteType: str
    aiCapability: str
    generationActive: bool
    siteCategory: str
    confidenceScore: float
    classifiedBy: str

class RiskAssessmentRequest(BaseModel):
    session: Dict[str, Any] = Field(default_factory=dict)
    classification: Dict[str, Any] = Field(default_factory=dict)
    policies: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class RiskAssessmentResponse(BaseModel):
    riskLevel: str
    reasons: List[str]
    riskScore: float
