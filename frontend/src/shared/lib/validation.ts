export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export interface SiteValidationErrors {
  name?: string;
  url?: string;
  environment?: string;
  projectId?: string;
  intervalSec?: string;
  timeoutSec?: string;
  degradationThresholdMs?: string;
}

export const validateSite = (data: {
  name: string;
  url: string;
  environment: string;
  projectId: string;
  intervalSec: number;
  timeoutSec: number;
  degradationThresholdMs: number;
}): SiteValidationErrors => {
  const errors: SiteValidationErrors = {};

  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters';
  }

  if (!data.url || !isValidUrl(data.url)) {
    errors.url = 'Please enter a valid URL';
  }

  if (!data.environment || data.environment.length < 2 || data.environment.length > 50) {
    errors.environment = 'Environment must be between 2 and 50 characters';
  }

  if (!data.projectId || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(data.projectId)) {
    errors.projectId = 'Project ID must be a valid UUID';
  }

  if (!data.intervalSec || data.intervalSec < 10) {
    errors.intervalSec = 'Interval must be at least 10 seconds';
  }

  if (!data.timeoutSec || data.timeoutSec < 1) {
    errors.timeoutSec = 'Timeout must be at least 1 second';
  }

  if (!data.degradationThresholdMs || data.degradationThresholdMs < 100) {
    errors.degradationThresholdMs = 'Degradation threshold must be at least 100ms';
  }

  return errors;
};

export interface CheckValidationErrors {
  type?: string;
  config?: string;
}

export const validateCheck = (data: {
  type: string;
  config: any;
}): CheckValidationErrors => {
  const errors: CheckValidationErrors = {};

  if (!data.type || !['HTTP', 'CONTENT', 'API', 'FORM'].includes(data.type)) {
    errors.type = 'Please select a valid check type';
  }

  if (!data.config || typeof data.config !== 'object') {
    errors.config = 'Check configuration is required';
  }

  return errors;
};

export const hasValidationErrors = (errors: Record<string, string | undefined>): boolean => {
  return Object.values(errors).some(error => error !== undefined);
};
