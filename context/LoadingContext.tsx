// context/LoadingContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoadingComplete: boolean;
  setLoadingComplete: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoadingComplete: false,
  setLoadingComplete: () => {},
});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  const setLoadingComplete = () => setIsLoadingComplete(true);

  return (
    <LoadingContext.Provider value={{ isLoadingComplete, setLoadingComplete }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}