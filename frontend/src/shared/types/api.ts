// Site related types
export type SiteStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface SiteDto {
  id: string;
  name: string;
  url: string;
  environment: string;
  projectId: string;
  intervalSec: number;
  timeoutSec: number;
  degradationThresholdMs: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastStatus?: SiteStatus;
  lastCheckAt?: string;
  lastResponseTimeMs?: number;
}

export interface CreateSiteDto {
  name: string;
  url: string;
  environment: string;
  intervalSec: number;
  timeoutSec: number;
  degradationThresholdMs: number;
  enabled: boolean;
}

export interface UpdateSiteDto extends Partial<CreateSiteDto> {}

// Check related types
export type CheckType = 'HTTP' | 'CONTENT' | 'API' | 'FORM';

export interface CheckDto {
  id: string;
  siteId: string;
  type: CheckType;
  config: any; // JSON object, validate per type
  enabled: boolean;
  createdAt?: string;
}

export interface CreateCheckDto {
  type: CheckType;
  config: any;
  enabled: boolean;
}

export interface UpdateCheckDto extends Partial<CreateCheckDto> {}

// Check result types
export type CheckResultStatus = 'PASS' | 'WARN' | 'FAIL';

export interface CheckResultDto {
  id: string;
  siteId: string;
  checkId?: string;
  status: CheckResultStatus;
  responseTimeMs?: number;
  error?: string | null;
  raw?: any;
  createdAt: string;
}

// WebSocket types
export interface WsSiteUpdate {
  type: string;
  siteId: string;
  status: SiteStatus;
  responseTimeMs?: number;
  reason?: string;
  checkResultId?: string;
  timestamp: string;
}

// API Error types
export interface ApiError {
  status: number;
  error: string;
  message: string;
  details?: Record<string, string>;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Query parameters
export interface ResultsQueryParams {
  from?: string;
  to?: string;
  limit?: number;
}

export interface ReportsQueryParams {
  siteId?: string;
  from?: string;
  to?: string;
  format: 'csv' | 'pdf';
}
