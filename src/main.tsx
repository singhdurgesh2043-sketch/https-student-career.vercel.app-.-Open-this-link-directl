import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

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
