import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './i18n/config';
import './index.css';
import { registerServiceWorker } from './lib/service-worker-registration';

// Register service worker
if ('serviceWorker' in navigator) {
  registerServiceWorker().catch((error) => {
    console.error('[SW] Failed to register service worker:', error);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

