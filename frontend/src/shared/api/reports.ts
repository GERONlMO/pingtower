import { apiClient } from './client';
import { ReportsQueryParams } from '@shared/types';
import { downloadFile } from '@shared/lib/utils';

export const reportsApi = {
  /**
   * Download report
   */
  download: async (params: ReportsQueryParams): Promise<void> => {
    const queryParams = new URLSearchParams();
    
    if (params.siteId) queryParams.append('siteId', params.siteId);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    queryParams.append('format', params.format);

    const url = `/reports?${queryParams.toString()}`;
    const blob = await apiClient.download(url);
    
    const filename = `report_${params.siteId || 'all'}_${new Date().toISOString().split('T')[0]}.${params.format}`;
    downloadFile(blob, filename);
  },

  /**
   * Download CSV report
   */
  downloadCsv: (params: Omit<ReportsQueryParams, 'format'>): Promise<void> => {
    return reportsApi.download({ ...params, format: 'csv' });
  },

  /**
   * Download PDF report
   */
  downloadPdf: (params: Omit<ReportsQueryParams, 'format'>): Promise<void> => {
    return reportsApi.download({ ...params, format: 'pdf' });
  },
};
