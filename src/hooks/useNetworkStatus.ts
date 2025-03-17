import { useState, useEffect } from 'react';

/**
 * Custom hook to track network status (online/offline)
 * @returns {boolean} True if the user is online, false otherwise
 */
const useNetworkStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Function to handle when the network goes offline
    const handleOffline = () => {
      setIsOnline(false);
    };

    // Function to handle when the network comes back online
    const handleOnline = () => {
      setIsOnline(true);
    };

    // Add event listeners for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus; 