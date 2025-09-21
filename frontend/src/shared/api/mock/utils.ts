// Helper functions for mock API

/**
 * Simulate network delay
 */
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => 
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

/**
 * Simulate realistic response time based on site status
 */
export const simulateResponseTime = (siteStatus: 'GREEN' | 'YELLOW' | 'RED'): number => {
  switch (siteStatus) {
    case 'GREEN':
      return Math.random() * 500 + 100; // 100-600ms
    case 'YELLOW':
      return Math.random() * 1000 + 800; // 800-1800ms
    case 'RED':
      return Math.random() * 2000 + 2000; // 2000-4000ms
    default:
      return 500;
  }
};

/**
 * Simulate check success rate based on site status
 */
export const simulateSuccessRate = (siteStatus: 'GREEN' | 'YELLOW' | 'RED'): boolean => {
  switch (siteStatus) {
    case 'GREEN':
      return Math.random() > 0.05; // 95% success rate
    case 'YELLOW':
      return Math.random() > 0.2; // 80% success rate
    case 'RED':
      return Math.random() > 0.7; // 30% success rate
    default:
      return true;
  }
};

/**
 * Generate realistic error message
 */
export const generateErrorMessage = (): string => {
  const errors = [
    'Connection timeout',
    'DNS resolution failed',
    'SSL certificate error',
    'Server returned 500',
    'Network unreachable',
    'Slow response time',
    'Content validation failed',
    'HTTP redirect loop',
  ];
  return errors[Math.floor(Math.random() * errors.length)];
};

/**
 * Simulate realistic check result
 */
export const simulateCheckResult = (siteStatus: 'GREEN' | 'YELLOW' | 'RED') => {
  const isHealthy = simulateSuccessRate(siteStatus);
  const responseTime = isHealthy ? simulateResponseTime(siteStatus) : null;
  
  return {
    isHealthy,
    responseTime: responseTime ? Math.round(responseTime) : null,
    error: isHealthy ? null : generateErrorMessage(),
    status: isHealthy ? 'PASS' : (Math.random() > 0.5 ? 'FAIL' : 'WARN'),
  };
};
