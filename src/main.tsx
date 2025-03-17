import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import '../styles/globals.css';
import { registerServiceWorker } from './serviceWorker';
import { initNetworkStatusTracker } from './utils/networkStatus';

// Register the service worker
registerServiceWorker();

// Initialize network status tracking
document.addEventListener('DOMContentLoaded', () => {
  initNetworkStatusTracker();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename={import.meta.env.PROD ? '/corvimia.github.io' : '/'}>
      <App />
    </Router>
  </React.StrictMode>
); 