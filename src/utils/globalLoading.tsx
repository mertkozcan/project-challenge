import { LoadingOverlay } from '@mantine/core';
import { useEffect, useState } from 'react';

/**
 * Global loading hook
 * Usage:
 * const { startLoading, stopLoading } = useGlobalLoading();
 * startLoading();
 * // ... async operation
 * stopLoading();
 */

let loadingCount = 0;
const listeners: Set<(loading: boolean) => void> = new Set();

export const globalLoading = {
  start: () => {
    loadingCount++;
    listeners.forEach(listener => listener(loadingCount > 0));
  },
  stop: () => {
    loadingCount = Math.max(0, loadingCount - 1);
    listeners.forEach(listener => listener(loadingCount > 0));
  },
  subscribe: (listener: (loading: boolean) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useGlobalLoading = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return globalLoading.subscribe(setLoading);
  }, []);

  return {
    loading,
    startLoading: globalLoading.start,
    stopLoading: globalLoading.stop,
  };
};

/**
 * Global Loading Overlay Component
 * Place this in your App.tsx to show loading overlay for all async operations
 */
export const GlobalLoadingOverlay = () => {
  const { loading } = useGlobalLoading();

  return (
    <LoadingOverlay
      visible={loading}
      zIndex={1000}
      overlayProps={{ radius: 'sm', blur: 2 }}
      loaderProps={{ color: 'blue', type: 'bars' }}
    />
  );
};
