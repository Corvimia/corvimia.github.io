// Service worker script
import { registerSW } from 'virtual:pwa-register';

// This is the code that registers the service worker
// It's called by main.tsx and handles the refreshing logic
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Handle the need for refresh logic
        if (confirm('New content available. Reload?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('App is ready for offline usage');
      },
    });
  }
}; 