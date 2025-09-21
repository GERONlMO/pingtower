import { configureStore } from '@reduxjs/toolkit';
import { siteReducer } from '@entities/site';

export const store = configureStore({
  reducer: {
    sites: siteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
