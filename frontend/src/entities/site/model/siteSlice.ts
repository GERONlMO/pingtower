import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SiteDto, CreateSiteDto, UpdateSiteDto } from '@shared/types';
import { sitesApi } from '@shared/api';

interface SiteState {
  sites: SiteDto[];
  currentSite: SiteDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: SiteState = {
  sites: [],
  currentSite: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchSites = createAsyncThunk(
  'sites/fetchSites',
  async () => {
    return await sitesApi.getAll();
  }
);

export const fetchSiteById = createAsyncThunk(
  'sites/fetchSiteById',
  async (id: string) => {
    return await sitesApi.getById(id);
  }
);

export const createSite = createAsyncThunk(
  'sites/createSite',
  async (data: CreateSiteDto) => {
    return await sitesApi.create(data);
  }
);

export const updateSite = createAsyncThunk(
  'sites/updateSite',
  async ({ id, data }: { id: string; data: UpdateSiteDto }) => {
    return await sitesApi.update(id, data);
  }
);

export const deleteSite = createAsyncThunk(
  'sites/deleteSite',
  async (id: string) => {
    await sitesApi.delete(id);
    return id;
  }
);

export const runSiteCheck = createAsyncThunk(
  'sites/runSiteCheck',
  async (id: string) => {
    await sitesApi.runCheck(id);
    return id;
  }
);

const siteSlice = createSlice({
  name: 'sites',
  initialState,
  reducers: {
    updateSiteStatus: (state, action: PayloadAction<{ id: string; status: SiteDto['lastStatus']; responseTimeMs?: number; lastCheckAt?: string }>) => {
      const { id, status, responseTimeMs, lastCheckAt } = action.payload;
      const site = state.sites.find(s => s.id === id);
      if (site) {
        site.lastStatus = status;
        if (responseTimeMs !== undefined) site.lastResponseTimeMs = responseTimeMs;
        if (lastCheckAt) site.lastCheckAt = lastCheckAt;
      }
      if (state.currentSite?.id === id) {
        state.currentSite.lastStatus = status;
        if (responseTimeMs !== undefined) state.currentSite.lastResponseTimeMs = responseTimeMs;
        if (lastCheckAt) state.currentSite.lastCheckAt = lastCheckAt;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSite: (state, action: PayloadAction<SiteDto | null>) => {
      state.currentSite = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sites
      .addCase(fetchSites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action) => {
        state.loading = false;
        state.sites = action.payload;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sites';
      })
      // Fetch site by ID
      .addCase(fetchSiteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSite = action.payload;
      })
      .addCase(fetchSiteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch site';
      })
      // Create site
      .addCase(createSite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSite.fulfilled, (state, action) => {
        state.loading = false;
        state.sites.push(action.payload);
      })
      .addCase(createSite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create site';
      })
      // Update site
      .addCase(updateSite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSite.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sites.findIndex(site => site.id === action.payload.id);
        if (index !== -1) {
          state.sites[index] = action.payload;
        }
        if (state.currentSite?.id === action.payload.id) {
          state.currentSite = action.payload;
        }
      })
      .addCase(updateSite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update site';
      })
      // Delete site
      .addCase(deleteSite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSite.fulfilled, (state, action) => {
        state.loading = false;
        state.sites = state.sites.filter(site => site.id !== action.payload);
        if (state.currentSite?.id === action.payload) {
          state.currentSite = null;
        }
      })
      .addCase(deleteSite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete site';
      })
      // Run site check
      .addCase(runSiteCheck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runSiteCheck.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(runSiteCheck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to run site check';
      });
  },
});

export const { updateSiteStatus, clearError, setCurrentSite } = siteSlice.actions;
export default siteSlice.reducer;
