import { useEffect } from 'react';
import useNetworkStatus from '@/hooks/useNetworkStatus';
import { toast } from 'sonner';

/**
 * Component that monitors network status and shows toast notifications
 * when the connection status changes.
 */
const NetworkStatus = () => {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      toast.success('You are back online!', {
        duration: 3000,
        id: 'network-status',
      });
      document.body.classList.remove('offline-mode');
    } else {
      toast.error('You are offline. Some features may be limited.', {
        duration: 5000,
        id: 'network-status',
      });
      document.body.classList.add('offline-mode');
    }
  }, [isOnline]);

  // This component doesn't render anything, it just handles side effects
  return null;
};

export default NetworkStatus; 