import React from 'react';
import { Box, Title, Text, Badge, Container } from '@mantine/core';
import { IconGridDots } from '@tabler/icons-react';
import { getGameTheme } from '@/utils/gameThemes';

interface BingoHeroProps {
  bannerUrl?: string;
  gameName: string;
  title: string;
  description: string;
  size: number;
}

const BingoHero: React.FC<BingoHeroProps> = ({
  bannerUrl,
  gameName,
  title,
  description,
  size,
}) => {
  const theme = getGameTheme(gameName);

  return (
    <Box
      style={{
        position: 'relative',
        height: '300px',
        overflow: 'hidden',
        borderRadius: '12px',
        marginBottom: '2rem',
      }}
    >
      {/* Banner Image with Overlay */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : theme.gradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5)',
        }}
      />

      {/* Gradient Overlay */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 100%)`,
        }}
      />

      {/* Content */}
      <Container
        size="xl"
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '2rem',
        }}
      >
        <Badge
          size="lg"
          color="blue"
          variant="filled"
          leftSection={<IconGridDots size={16} />}
          mb="md"
          style={{
            boxShadow: `0 0 20px ${theme.glow}`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          {size}x{size} BINGO BOARD
        </Badge>

        <Title
          order={1}
          size="2.5rem"
          style={{
            color: 'white',
            textShadow: `0 0 30px ${theme.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
            marginBottom: '0.5rem',
            fontWeight: 900,
          }}
        >
          {title}
        </Title>

        <Text
          size="lg"
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            marginBottom: '0.5rem',
          }}
        >
          {description}
        </Text>

        <Text
          size="md"
          style={{
            color: theme.primary,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            fontWeight: 600,
          }}
        >
          {gameName}
        </Text>
      </Container>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default BingoHero;
