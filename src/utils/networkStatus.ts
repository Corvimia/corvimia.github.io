// Simple utility to handle online/offline status
import { toast } from 'sonner';

// Initialize network status tracker
export const initNetworkStatusTracker = () => {
  // Function to handle when the network goes offline
  const handleOffline = () => {
    toast.error('You are offline. Some features may be limited.', {
      duration: 5000,
      id: 'network-status',
    });
    document.body.classList.add('offline-mode');
  };

  // Function to handle when the network comes back online
  const handleOnline = () => {
    toast.success('You are back online!', {
      duration: 3000,
      id: 'network-status',
    });
    document.body.classList.remove('offline-mode');
  };

  // Check initial status
  if (!navigator.onLine) {
    handleOffline();
  }

  // Add event listeners for network status changes
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}; 