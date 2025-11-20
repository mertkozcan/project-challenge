import React from 'react';
import { Box, Title, Text, Badge, Group, Container } from '@mantine/core';
import { IconUsers, IconTrophy } from '@tabler/icons-react';
import { getGameTheme } from '@/utils/gameThemes';

interface ChallengeHeroProps {
  bannerUrl?: string;
  gameName: string;
  challengeName: string;
  type: string;
  participantCount: number;
}

const ChallengeHero: React.FC<ChallengeHeroProps> = ({
  bannerUrl,
  gameName,
  challengeName,
  type,
  participantCount,
}) => {
  const theme = getGameTheme(gameName);

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'green';
      case 'weekly': return 'yellow';
      case 'permanent': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Box
      style={{
        position: 'relative',
        height: '400px',
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
          filter: 'brightness(0.6)',
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
          background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)`,
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
        <Group mb="md">
          <Badge
            size="lg"
            color={getChallengeTypeColor(type)}
            variant="filled"
            style={{
              boxShadow: `0 0 20px ${theme.glow}`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            {type.toUpperCase()}
          </Badge>
          <Badge
            size="lg"
            color="gray"
            variant="light"
            leftSection={<IconUsers size={16} />}
          >
            {participantCount} Participants
          </Badge>
        </Group>

        <Title
          order={1}
          size="3rem"
          style={{
            color: 'white',
            textShadow: `0 0 30px ${theme.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
            marginBottom: '0.5rem',
            fontWeight: 900,
          }}
        >
          {challengeName}
        </Title>

        <Text
          size="xl"
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

export default ChallengeHero;
