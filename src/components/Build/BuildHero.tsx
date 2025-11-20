import React from 'react';
import { Box, Title, Text, Badge, Group, Container } from '@mantine/core';
import { IconSword, IconUser } from '@tabler/icons-react';
import { getGameTheme } from '@/utils/gameThemes';

interface BuildHeroProps {
  bannerUrl?: string;
  gameName: string;
  buildName: string;
  username: string;
  isOfficial: boolean;
}

const BuildHero: React.FC<BuildHeroProps> = ({
  bannerUrl,
  gameName,
  buildName,
  username,
  isOfficial,
}) => {
  const theme = getGameTheme(gameName);

  return (
    <Box
      style={{
        position: 'relative',
        height: '350px',
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
        <Group mb="md">
          <Badge
            size="lg"
            color={isOfficial ? 'yellow' : 'blue'}
            variant="filled"
            leftSection={<IconSword size={16} />}
            style={{
              boxShadow: `0 0 20px ${theme.glow}`,
            }}
          >
            {isOfficial ? 'OFFICIAL BUILD' : 'COMMUNITY BUILD'}
          </Badge>
          <Badge
            size="lg"
            color="gray"
            variant="light"
            leftSection={<IconUser size={16} />}
          >
            by {username}
          </Badge>
        </Group>

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
          {buildName}
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
    </Box>
  );
};

export default BuildHero;
