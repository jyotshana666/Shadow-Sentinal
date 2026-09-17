package com.shadowsentinel.backend.risk.service;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;
import com.shadowsentinel.backend.risk.entity.RiskAssessment;

public interface RiskService {
    RiskAssessment assessRisk(BrowserSession session, ClassificationResult classification);
}
