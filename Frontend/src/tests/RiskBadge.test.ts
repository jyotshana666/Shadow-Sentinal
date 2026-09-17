import { describe, it, expect } from 'vitest';

describe('Frontend Types & Validation', () => {
  it('validates risk badge levels', () => {
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    expect(riskLevels).toHaveLength(4);
    expect(riskLevels).toContain('CRITICAL');
  });

  it('validates environment base URL configuration', () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    expect(baseUrl).toBeDefined();
    expect(typeof baseUrl).toBe('string');
  });
});
