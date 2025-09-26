'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, progress, setProgress }}>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={progress} className="h-1" />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}