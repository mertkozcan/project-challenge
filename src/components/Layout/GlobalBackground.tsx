import React from 'react';
import { useComputedColorScheme } from '@mantine/core';

export const GlobalBackground: React.FC = () => {
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  if (computedColorScheme !== 'dark') return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, pointerEvents: 'none', background: '#0B0C15' }}>
      {/* Immersive Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '80vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(80, 40, 150, 0.25) 0%, rgba(11, 12, 21, 0) 70%)',
        zIndex: 0,
      }} />
      
      {/* Animated Particles or Grid (Optional - CSS based) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
        zIndex: 0,
      }} />
    </div>
  );
};
