package com.shadowsentinel.backend.classification.service;

import com.shadowsentinel.backend.browser.entity.BrowserSession;
import com.shadowsentinel.backend.browser.entity.ClassificationEvidence;
import com.shadowsentinel.backend.classification.entity.ClassificationResult;

public interface ClassificationService {
    ClassificationResult classify(BrowserSession session, ClassificationEvidence evidence);
}
