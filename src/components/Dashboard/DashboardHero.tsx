import React from 'react';
import { Paper, Title, Text, Button, Group, Box, BackgroundImage, Badge, Stack, ThemeIcon } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconTrophy, IconSword, IconTarget, IconArrowRight, IconStar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DashboardHeroProps {
  challengeOfTheDay: any;
  featuredBuild: any;
  activeRoomCount: number;
}

const HeroSlide = ({ image, title, subtitle, type, link, actionLabel, color, icon: Icon }: any) => (
  <Paper
    radius="md"
    style={{
      height: 400,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <BackgroundImage
      src={image}
      radius="md"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        filter: 'brightness(0.4)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
    
    <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: `linear-gradient(to top, ${color}90 0%, transparent 100%)`, 
        zIndex: 1 
    }} />

    <Stack style={{ position: 'relative', zIndex: 2, padding: '2rem' }} gap="xs">
      <Group>
        <Badge size="lg" color={color} leftSection={<Icon size={14} />}>
          {type}
        </Badge>
        <Badge variant="outline" color="white" style={{ backdropFilter: 'blur(4px)' }}>
          Featured
        </Badge>
      </Group>
      
      <Title order={1} style={{ color: 'white', fontSize: '2.5rem', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
        {title}
      </Title>
      
      <Text size="lg" c="dimmed" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 600, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
        {subtitle}
      </Text>

      <Button 
        component={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        variant="gradient" 
        gradient={{ from: color, to: 'cyan' }} 
        size="lg" 
        mt="md" 
        rightSection={<IconArrowRight size={20} />}
        style={{ width: 'fit-content' }}
        onClick={() => window.location.href = link} // Using window.location for simplicity in this component, ideally useNavigate
      >
        {actionLabel}
      </Button>
    </Stack>
  </Paper>
);

export const DashboardHero: React.FC<DashboardHeroProps> = ({ challengeOfTheDay, featuredBuild, activeRoomCount }) => {
  const navigate = useNavigate();

  return (
    <Box mb={40}>
      <Carousel
        withIndicators
        height={400}
        slideSize="100%"
        slideGap="md"
        styles={{
          control: {
            '&[data-inactive]': {
              opacity: 0,
              cursor: 'default',
            },
          },
        }}
      >
        {/* Slide 1: Challenge of the Day */}
        {challengeOfTheDay && (
          <Carousel.Slide>
            <HeroSlide
              image={challengeOfTheDay.gameImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
              title={challengeOfTheDay.challenge_name}
              subtitle={challengeOfTheDay.description}
              type="Daily Challenge"
              link={`/challenges/${challengeOfTheDay.id}`}
              actionLabel="Accept Challenge"
              color="orange"
              icon={IconTarget}
            />
          </Carousel.Slide>
        )}

        {/* Slide 2: Featured Build */}
        {featuredBuild && (
          <Carousel.Slide>
            <HeroSlide
              image="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80" // Placeholder for build image
              title={featuredBuild.build_name}
              subtitle={`A powerful build for ${featuredBuild.game_name} by ${featuredBuild.username || 'Unknown'}`}
              type="Featured Build"
              link={`/builds/${featuredBuild.id}`}
              actionLabel="View Build"
              color="blue"
              icon={IconSword}
            />
          </Carousel.Slide>
        )}

        {/* Slide 3: Bingo */}
        <Carousel.Slide>
          <HeroSlide
            image="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80"
            title="Live Bingo Events"
            subtitle={`Join ${activeRoomCount} active rooms or start your own bingo run now!`}
            type="Multiplayer"
            link="/bingo-challenges"
            actionLabel="Play Bingo"
            color="green"
            icon={IconTrophy}
          />
        </Carousel.Slide>
      </Carousel>
    </Box>
  );
};
