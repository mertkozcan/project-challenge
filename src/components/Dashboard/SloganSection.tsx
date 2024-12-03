import React from 'react';
import { Box, Text } from '@mantine/core';

const SloganSection: React.FC = () => {
  return (
    <Box
      style={{
        width: '100%',
        padding: '20px 0',
        background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.9), rgba(21, 21, 33, 0.9))',
        textAlign: 'center',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
        marginBottom: '20px',
        borderRadius: '8px',
      }}
    >
      <Text
        size="lg"
        fw={700}
        style={{
          fontFamily: '"Press Start 2P", sans-serif', // Piksel yazı tipi
          background: 'linear-gradient(to right, #FFA500, #FF4500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          fontSize: '1.5rem',
        }}
      >
        EMBRACE YOUR GAMER SIDE, CHALLENGE THE WORLD!
      </Text>
    </Box>
  );
};

export default SloganSection;
