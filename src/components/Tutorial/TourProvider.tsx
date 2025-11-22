import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { tourStepsMap, TourType } from './TourSteps';

interface TourContextType {
  startTour: (tourType: TourType) => void;
  isTourActive: boolean;
  completedTours: TourType[];
  resetTours: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = 'completed_tours';

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [completedTours, setCompletedTours] = useState<TourType[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const startTour = useCallback((tourType: TourType) => {
    const tourSteps = tourStepsMap[tourType];
    if (tourSteps) {
      setSteps(tourSteps);
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // Mark tour as completed (we'll need to track which tour was active)
      // For now, we'll just stop the tour
    }
  }, []);

  const resetTours = useCallback(() => {
    setCompletedTours([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: TourContextType = {
    startTour,
    isTourActive: run,
    completedTours,
    resetTours,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      <Joyride
        steps={steps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#228be6',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 8,
          },
          buttonNext: {
            borderRadius: 4,
            padding: '8px 16px',
          },
          buttonBack: {
            marginRight: 8,
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};
