import { apiClient } from './client';
import { CheckDto, CreateCheckDto, UpdateCheckDto } from '@shared/types';

export const checksApi = {
  /**
   * Get checks for site
   */
  getBySiteId: (siteId: string): Promise<CheckDto[]> => {
    return apiClient.get<CheckDto[]>(`/sites/${siteId}/checks`);
  },

  /**
   * Create new check for site
   */
  create: (siteId: string, data: CreateCheckDto): Promise<CheckDto> => {
    return apiClient.post<CheckDto>(`/sites/${siteId}/checks`, data);
  },

  /**
   * Update check
   */
  update: (checkId: string, data: UpdateCheckDto): Promise<CheckDto> => {
    return apiClient.put<CheckDto>(`/checks/${checkId}`, data);
  },

  /**
   * Delete check
   */
  delete: (checkId: string): Promise<void> => {
    return apiClient.delete<void>(`/checks/${checkId}`);
  },

  /**
   * Run manual check
   */
  runCheck: (checkId: string): Promise<void> => {
    return apiClient.post<void>(`/checks/${checkId}/run`);
  },
};
