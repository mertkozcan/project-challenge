import { LoadingOverlay } from '@mantine/core';
import { useEffect, useState } from 'react';

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
  subscribe: (listener: (loading: boolean) => void): () => void => {
    listeners.add(listener);
    return () => {
      // Boolean dönüşü yok sayıyoruz, cleanup fonksiyonu void olsun
      listeners.delete(listener);
    };
  },
};

export const useGlobalLoading = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // subscribe artık () => void döndüğü için React'in beklediği Destructor tipiyle uyumlu
    return globalLoading.subscribe(setLoading);
  }, []);

  return {
    loading,
    startLoading: globalLoading.start,
    stopLoading: globalLoading.stop,
  };
};

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
