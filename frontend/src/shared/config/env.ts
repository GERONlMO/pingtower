export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082',
    wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:8082/ws/dashboard',
  },
  dev: {
    isDev: import.meta.env.VITE_DEV_MODE === 'true',
    useMockApi: import.meta.env.VITE_MOCK_API === 'true',
  },
} as const;