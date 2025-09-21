import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@app/App'
import { config } from '@shared/config/env'

// Start MSW in development
if (config.dev.useMockApi && import.meta.env.DEV) {
  const { worker } = await import('@shared/api/mock');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)
