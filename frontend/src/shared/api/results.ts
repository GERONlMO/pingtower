import { apiClient } from './client';
import { CheckResultDto, ResultsQueryParams } from '@shared/types';

export const resultsApi = {
  /**
   * Get results for site
   */
  getBySiteId: (siteId: string, params?: ResultsQueryParams): Promise<CheckResultDto[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/sites/${siteId}/results?${queryString}` : `/sites/${siteId}/results`;
    
    return apiClient.get<CheckResultDto[]>(url);
  },

  /**
   * Get latest results for site
   */
  getLatest: (siteId: string, limit: number = 50): Promise<CheckResultDto[]> => {
    return resultsApi.getBySiteId(siteId, { limit });
  },
};
