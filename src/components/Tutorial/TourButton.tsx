import React from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';
import { useTour } from './TourProvider';
import { TourType } from './TourSteps';

interface TourButtonProps {
  tourType: TourType;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const TourButton: React.FC<TourButtonProps> = ({ tourType, position = 'bottom-right' }) => {
  const { startTour } = useTour();

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'top-right': { top: 80, right: 20 },
    'top-left': { top: 80, left: 20 },
  };

  return (
    <Tooltip label="Start Tutorial" position="left">
      <ActionIcon
        size="xl"
        radius="xl"
        variant="filled"
        color="blue"
        onClick={() => startTour(tourType)}
        style={{
          position: 'fixed',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          ...positionStyles[position],
        }}
      >
        <IconHelp size={24} />
      </ActionIcon>
    </Tooltip>
  );
};

export default TourButton;
