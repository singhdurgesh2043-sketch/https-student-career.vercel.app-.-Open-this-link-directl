import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// Register PWA Service Worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('PWA Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration skipped/failed:', err);
      });
  });
}

// Ensure root element exists before mounting (prevents Android WebView blank screen error)
const rootElement = document.getElementById('root');

if (!rootElement) {
  const fallbackDiv = document.createElement('div');
  fallbackDiv.id = 'root';
  document.body.appendChild(fallbackDiv);
  ReactDOM.createRoot(fallbackDiv).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
