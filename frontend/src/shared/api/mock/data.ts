import { SiteDto, CheckDto, CheckResultDto } from '@shared/types';

// Realistic mock data for testing
export const mockSites: SiteDto[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Google',
    url: 'https://www.google.com',
    intervalSec: 60,
    timeoutSec: 5,
    degradationThresholdMs: 2000,
    enabled: true,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    lastStatus: 'GREEN',
    lastCheckAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    lastResponseTimeMs: 180,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'GitHub',
    url: 'https://github.com',
    intervalSec: 60,
    timeoutSec: 5,
    degradationThresholdMs: 1500,
    enabled: true,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
    lastStatus: 'GREEN',
    lastCheckAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    lastResponseTimeMs: 320,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    intervalSec: 30,
    timeoutSec: 3,
    degradationThresholdMs: 1000,
    enabled: true,
    createdAt: '2025-01-15T11:00:00Z',
    updatedAt: '2025-01-15T11:00:00Z',
    lastStatus: 'YELLOW',
    lastCheckAt: new Date(Date.now() - 30 * 1000).toISOString(),
    lastResponseTimeMs: 1800,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Reddit',
    url: 'https://www.reddit.com',
    intervalSec: 120,
    timeoutSec: 10,
    degradationThresholdMs: 3000,
    enabled: true,
    createdAt: '2025-01-15T11:30:00Z',
    updatedAt: '2025-01-15T11:30:00Z',
    lastStatus: 'RED',
    lastCheckAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    lastResponseTimeMs: null,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'YouTube',
    url: 'https://www.youtube.com',
    intervalSec: 60,
    timeoutSec: 5,
    degradationThresholdMs: 2000,
    enabled: false,
    createdAt: '2025-01-15T12:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z',
    lastStatus: 'GREEN',
    lastCheckAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    lastResponseTimeMs: 450,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Twitter',
    url: 'https://twitter.com',
    intervalSec: 45,
    timeoutSec: 8,
    degradationThresholdMs: 2500,
    enabled: true,
    createdAt: '2025-01-15T12:30:00Z',
    updatedAt: '2025-01-15T12:30:00Z',
    lastStatus: 'GREEN',
    lastCheckAt: new Date(Date.now() - 45 * 1000).toISOString(),
    lastResponseTimeMs: 890,
  },
];

export const mockChecks: CheckDto[] = [
  {
    id: 'check-1',
    siteId: '11111111-1111-1111-1111-111111111111',
    type: 'HTTP',
    config: {
      url: 'https://www.google.com',
      expectStatus: 200,
    },
    enabled: true,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'check-2',
    siteId: '11111111-1111-1111-1111-111111111111',
    type: 'CONTENT',
    config: {
      url: 'https://www.google.com',
      keyword: 'Google',
    },
    enabled: true,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'check-3',
    siteId: '22222222-2222-2222-2222-222222222222',
    type: 'HTTP',
    config: {
      url: 'https://github.com',
      expectStatus: 200,
    },
    enabled: true,
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'check-4',
    siteId: '33333333-3333-3333-3333-333333333333',
    type: 'HTTP',
    config: {
      url: 'https://stackoverflow.com',
      expectStatus: 200,
    },
    enabled: true,
    createdAt: '2025-01-15T11:00:00Z',
  },
  {
    id: 'check-5',
    siteId: '44444444-4444-4444-4444-444444444444',
    type: 'HTTP',
    config: {
      url: 'https://www.reddit.com',
      expectStatus: 200,
    },
    enabled: true,
    createdAt: '2025-01-15T11:30:00Z',
  },
];

// Generate realistic mock results
export const generateMockResults = (): CheckResultDto[] => {
  const results: CheckResultDto[] = [];
  const now = Date.now();
  
  // Generate results for each site over the last 24 hours
  mockSites.forEach((site, siteIndex) => {
    const checks = mockChecks.filter(check => check.siteId === site.id);
    
    checks.forEach((check, checkIndex) => {
      // Generate 20 results per check over the last 24 hours
      for (let i = 0; i < 20; i++) {
        const timeAgo = now - (i * 60 * 60 * 1000); // Every hour
        const baseResponseTime = site.lastResponseTimeMs || 500;
        const variation = Math.random() * 200 - 100; // ±100ms variation
        const responseTime = Math.max(50, baseResponseTime + variation);
        
        let status: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
        let error: string | null = null;
        
        // Simulate different statuses based on site
        if (site.lastStatus === 'RED') {
          status = Math.random() > 0.3 ? 'FAIL' : 'WARN';
          error = status === 'FAIL' ? 'Connection timeout' : 'Slow response';
        } else if (site.lastStatus === 'YELLOW') {
          status = Math.random() > 0.7 ? 'WARN' : 'PASS';
          if (status === 'WARN') error = 'Response time exceeded threshold';
        }
        
        results.push({
          id: `result-${siteIndex}-${checkIndex}-${i}`,
          siteId: site.id,
          checkId: check.id,
          status,
          responseTimeMs: status === 'FAIL' ? null : Math.round(responseTime),
          error,
          raw: {
            statusCode: status === 'FAIL' ? 0 : 200,
            bodySnippet: status === 'FAIL' ? null : '<html>...</html>',
            timestamp: new Date(timeAgo).toISOString(),
          },
          createdAt: new Date(timeAgo).toISOString(),
        });
      }
    });
  });
  
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mockResults = generateMockResults();

