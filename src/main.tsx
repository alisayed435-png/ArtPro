/**
 * Application Entry Point
 * Initializes MSW and renders the React app
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

async function enableMocking() {
  // Enable MSW in both development and production for demo mode
  const { worker } = await import('./mocks/browser');

  // Start the worker with service worker options
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}

// Initialize the app after MSW is ready
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
