/**
 * Shadow Sentinel Frontend Type Definitions matching Spring Boot Backend DTOs.
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}

export interface AuthResponseDto {
  jwt: string;
  userId: string;
  orgId: string;
  email: string;
  role: 'USER' | 'ADMIN';
  jwtExpiry: number;
}

export interface UserResponseDto {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  orgId: string;
  status: string;
  createdAt: string;
}

export interface BrowserSession {
  sessionId: string;
  userId: string;
  orgId: string;
  domain: string;
  startTime: string;
  endTime?: string;
  duration: number;
  visitCount: number;
  requestCount: number;
  requestFrequency: number;
  rapidRequestBurst: boolean;
  sseDetected: boolean;
  totalSseEvents: number;
  interactionCount: number;
  peakRequestWindow: number;
  sessionEngagement: 'LOW' | 'MEDIUM' | 'HIGH';
  siteType: 'ai_website' | 'ai_capable_website' | 'non_ai_website' | 'monitored_website';
  aiCapability: 'ai_capable' | 'non_ai_capable' | 'not_applicable';
  generationActive: boolean;
  siteCategory: string;
  createdAt: string;
}

export interface ClassificationResponseDto {
  id: string;
  sessionId: string;
  siteType: string;
  aiCapability: string;
  generationActive: boolean;
  siteCategory: string;
  confidenceScore: number;
  classifiedBy: string;
  createdAt: string;
}

export interface RiskResponseDto {
  id: string;
  sessionId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  evaluatedAt: string;
}

export interface AlertDto {
  id: string;
  userId: string;
  userEmail: string;
  sessionId: string;
  domain: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

export interface PolicyDto {
  id?: string;
  name: string;
  description: string;
  domainPattern: string;
  minRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'BLOCK' | 'ALERT' | 'MONITOR';
  enabled: boolean;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}
