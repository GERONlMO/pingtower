import { apiClient } from './client';
import { SiteDto, CreateSiteDto, UpdateSiteDto } from '@shared/types';

export const sitesApi = {
  /**
   * Get all sites
   */
  getAll: (): Promise<SiteDto[]> => {
    return apiClient.get<SiteDto[]>('/api/services');
  },

  /**
   * Get site by ID
   */
  getById: (id: string): Promise<SiteDto> => {
    return apiClient.get<SiteDto>(`/api/services/${id}`);
  },

  /**
   * Create new site
   */
  create: (data: CreateSiteDto): Promise<SiteDto> => {
    return apiClient.post<SiteDto>('/api/services', data);
  },

  /**
   * Update site
   */
  update: (id: string, data: UpdateSiteDto): Promise<SiteDto> => {
    return apiClient.put<SiteDto>(`/api/services/${id}`, data);
  },

  /**
   * Delete site
   */
  delete: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/api/services/${id}`);
  },

  /**
   * Run manual check for site
   */
  runCheck: (id: string): Promise<void> => {
    return apiClient.post<void>(`/api/services/${id}/run`);
  },
};
