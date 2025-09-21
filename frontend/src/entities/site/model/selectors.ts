import { RootState } from '@app/store';

export const selectSites = (state: RootState) => state.sites.sites;
export const selectCurrentSite = (state: RootState) => state.sites.currentSite;
export const selectSitesLoading = (state: RootState) => state.sites.loading;
export const selectSitesError = (state: RootState) => state.sites.error;

export const selectSiteById = (state: RootState, id: string) => 
  state.sites.sites.find(site => site.id === id);

export const selectSitesByStatus = (state: RootState, status: string) =>
  state.sites.sites.filter(site => site.lastStatus === status);

export const selectSitesCount = (state: RootState) => state.sites.sites.length;

export const selectHealthySitesCount = (state: RootState) =>
  state.sites.sites.filter(site => site.lastStatus === 'GREEN').length;

export const selectDegradedSitesCount = (state: RootState) =>
  state.sites.sites.filter(site => site.lastStatus === 'YELLOW').length;

export const selectDownSitesCount = (state: RootState) =>
  state.sites.sites.filter(site => site.lastStatus === 'RED').length;
