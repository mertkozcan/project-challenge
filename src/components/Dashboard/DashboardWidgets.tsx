import React from 'react';
import { Paper, Text, Title, Group, ThemeIcon, Button, RingProgress, Stack, Badge, Avatar, ActionIcon, Progress, SimpleGrid } from '@mantine/core';
import { IconTrophy, IconFlame, IconClock, IconArrowRight, IconTarget, IconUsers, IconStar, IconRocket, IconPlus, IconDeviceGamepad2, IconSword } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- Widget Wrapper ---
const WidgetWrapper = ({ children, onClick, className, style, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, translateY: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{ height: '100%', cursor: onClick ? 'pointer' : 'default', ...style }}
    className={className}
  >
    <Paper
      h="100%"
      p="md"
      radius="lg"
      style={{
        background: 'rgba(20, 20, 30, 0.6)', // Darker background for better contrast
        backdropFilter: 'blur(16px)', // Stronger blur
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', // Deeper shadow
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Subtle gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none',
      }} />
      {children}
    </Paper>
  </motion.div>
);

// --- 1. Challenge Spotlight Widget (2x2) ---
export const ChallengeSpotlightWidget = ({ challenge, loading }: any) => {
  const navigate = useNavigate();
  
  if (loading || !challenge) return <WidgetWrapper><Text>Loading...</Text></WidgetWrapper>;

  return (
    <WidgetWrapper onClick={() => navigate(`/challenges/${challenge.id}`)} style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9)), url(${challenge.gameImage || 'https://placehold.co/600x400'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }} />
      
      <Stack justify="space-between" h="100%" style={{ position: 'relative', zIndex: 1 }}>
        <Group justify="space-between">
          <Badge size="lg" color="red" variant="filled" leftSection={<IconFlame size={14} />}>
            Challenge of the Day
          </Badge>
          <ThemeIcon variant="light" color="white" radius="xl" size="lg">
            <IconArrowRight size={20} />
          </ThemeIcon>
        </Group>

        <div>
          <Text c="dimmed" size="sm" fw={700} tt="uppercase" mb={4}>{challenge.game_name}</Text>
          <Title order={2} c="white" mb="xs" style={{ fontSize: '2rem', lineHeight: 1.1 }}>
            {challenge.challenge_name}
          </Title>
          <Text c="gray.3" lineClamp={2} mb="lg" size="sm" maw={400}>
            {challenge.description}
          </Text>
          
          <Group>
            <Button size="md" variant="gradient" gradient={{ from: 'orange', to: 'red' }}>
              Accept Challenge
            </Button>
            <Badge size="lg" variant="outline" color="yellow" leftSection={<IconTrophy size={14} />}>
              {challenge.reward_xp} XP
            </Badge>
          </Group>
        </div>
      </Stack>
    </WidgetWrapper>
  );
};

// --- 2. User Progress Widget (1x1) ---
export const UserProgressWidget = ({ stats, user }: any) => {
  const navigate = useNavigate();
  const level = user?.level || 1;
  const xp = user?.total_xp || 0;
  const nextLevelXp = level * 1000; // Example formula
  const progress = (xp / nextLevelXp) * 100;

  return (
    <WidgetWrapper onClick={() => navigate(`/profile/${user?.username}`)} delay={0.1}>
      <Group justify="space-between" mb="xs">
        <Text fw={700} c="dimmed" size="xs" tt="uppercase">My Rank</Text>
        <ThemeIcon variant="light" color="blue" radius="md">
          <IconTrophy size={16} />
        </ThemeIcon>
      </Group>
      
      <Stack gap="xs" align="center" justify="center" flex={1}>
        <RingProgress
          size={100}
          thickness={8}
          roundCaps
          sections={[{ value: progress, color: 'blue' }]}
          label={
            <Text ta="center" fw={700} size="xl">
              {level}
            </Text>
          }
        />
        <Text size="xs" c="dimmed">Level {level}</Text>
        <Text size="xs" fw={700}>{xp} / {nextLevelXp} XP</Text>
      </Stack>
    </WidgetWrapper>
  );
};

// --- 3. Quick Action: Create (1x1) ---
export const QuickCreateWidget = ({ totalChallenges }: { totalChallenges?: number }) => {
  const navigate = useNavigate();
  return (
    <WidgetWrapper onClick={() => navigate('/challenges/create')} delay={0.15}>
      <Stack justify="space-between" h="100%">
        <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
          <IconPlus size={24} />
        </ThemeIcon>
        <div>
          <Text fw={700} size="lg">Create</Text>
          <Text size="xs" c="dimmed">New Challenge</Text>
          {totalChallenges !== undefined && (
             <Badge size="xs" variant="light" color="blue" mt={4}>{totalChallenges}+ Challenges</Badge>
          )}
        </div>
      </Stack>
    </WidgetWrapper>
  );
};

// --- 4. Quick Action: Bingo (1x1) ---
export const QuickBingoWidget = ({ activeRooms }: { activeRooms?: number }) => {
  const navigate = useNavigate();
  return (
    <WidgetWrapper onClick={() => navigate('/bingo/rooms')} delay={0.2}>
      <Stack justify="space-between" h="100%">
        <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'grape', to: 'pink' }}>
          <IconDeviceGamepad2 size={24} />
        </ThemeIcon>
        <div>
          <Text fw={700} size="lg">Bingo</Text>
          <Text size="xs" c="dimmed">Join Room</Text>
          {activeRooms !== undefined && (
            <Badge size="xs" variant="dot" color="green" mt={4}>{activeRooms} Live Rooms</Badge>
          )}
        </div>
      </Stack>
    </WidgetWrapper>
  );
};

// --- 5. Live Pulse Widget (1x2) ---
export const LivePulseWidget = ({ activities }: any) => {
  return (
    <WidgetWrapper style={{ gridRow: 'span 2' }} delay={0.25}>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
            <ThemeIcon color="green" variant="light" size="sm" radius="xl">
                <IconRocket size={12} />
            </ThemeIcon>
            <Text fw={800} c="white" size="xs" tt="uppercase" style={{ letterSpacing: '1px' }}>Live Pulse</Text>
        </Group>
        <Badge size="xs" variant="dot" color="green" className="animate-pulse">Live</Badge>
      </Group>
      
      <Stack gap="sm" style={{ overflow: 'hidden' }}>
        {activities.map((activity: any, index: number) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Paper p="xs" radius="md" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Group wrap="nowrap" align="center">
                    <ThemeIcon size="md" radius="xl" variant="gradient" gradient={activity.type === 'challenge' ? { from: 'orange', to: 'red' } : { from: 'blue', to: 'cyan' }}>
                        {activity.type === 'challenge' ? <IconTarget size={14} /> : <IconSword size={14} />}
                    </ThemeIcon>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Text size="xs" fw={700} c="white" truncate>{activity.title}</Text>
                    <Group gap={4}>
                        <Text size="xs" c="dimmed">by</Text>
                        <Text size="xs" c="blue.3" fw={600} truncate>{activity.user}</Text>
                    </Group>
                    </div>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap', fontSize: '10px' }}>{activity.time}</Text>
                </Group>
            </Paper>
          </motion.div>
        ))}
        {activities.length === 0 && <Text size="sm" c="dimmed">No recent activity.</Text>}
      </Stack>
    </WidgetWrapper>
  );
};

// --- 6. Featured Build Widget (1x1) ---
export const FeaturedBuildWidget = ({ build }: any) => {
    const navigate = useNavigate();
    if (!build) return null;

    return (
        <WidgetWrapper onClick={() => navigate(`/builds/${build.id}`)} delay={0.3}>
             <Stack justify="space-between" h="100%">
                <Group justify="space-between">
                    <ThemeIcon size="lg" radius="md" variant="light" color="red">
                        <IconSword size={20} />
                    </ThemeIcon>
                    <Badge size="xs" color="yellow">Featured</Badge>
                </Group>
                <div>
                    <Text fw={700} size="md" lineClamp={1}>{build.build_name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>{build.game_name}</Text>
                </div>
            </Stack>
        </WidgetWrapper>
    );
};

// --- 7. Stats Widget (2x1) ---
export const StatsOverviewWidget = ({ stats }: any) => {
  return (
    <WidgetWrapper style={{ gridColumn: 'span 2' }} delay={0.3}>
      <Group h="100%" justify="space-around">
        <Stack align="center" gap={4}>
          <ThemeIcon variant="light" color="green" size="lg" radius="xl">
            <IconTarget size={20} />
          </ThemeIcon>
          <Text fw={700} size="xl">{stats.completedChallenges}</Text>
          <Text size="xs" c="dimmed">Completed</Text>
        </Stack>
        <Stack align="center" gap={4}>
           <ThemeIcon variant="light" color="orange" size="lg" radius="xl">
            <IconClock size={20} />
          </ThemeIcon>
          <Text fw={700} size="xl">{stats.activeChallenges}</Text>
          <Text size="xs" c="dimmed">Active</Text>
        </Stack>
        <Stack align="center" gap={4}>
           <ThemeIcon variant="light" color="yellow" size="lg" radius="xl">
            <IconStar size={20} />
          </ThemeIcon>
          <Text fw={700} size="xl">{stats.points}</Text>
          <Text size="xs" c="dimmed">Points</Text>
        </Stack>
      </Group>
    </WidgetWrapper>
  );
};

// --- 8. Trending Builds Widget (2x1) ---
export const TrendingBuildsWidget = ({ builds }: { builds: any[] }) => {
    const navigate = useNavigate();
    // Simple carousel effect or just display 2 side by side
    const displayBuilds = builds.slice(0, 2);

    return (
        <WidgetWrapper style={{ gridColumn: 'span 2' }} delay={0.35}>
            <Group justify="space-between" mb="sm">
                <Group gap="xs">
                    <ThemeIcon color="orange" variant="light" size="md">
                        <IconFlame size={16} />
                    </ThemeIcon>
                    <Text fw={700} size="sm" tt="uppercase">Trending Builds</Text>
                </Group>
                <Button variant="subtle" size="xs" onClick={() => navigate('/builds')}>View All</Button>
            </Group>
            <SimpleGrid cols={2} spacing="xs">
                {displayBuilds.map((build) => (
                    <Paper 
                        key={build.id} 
                        p="xs" 
                        radius="md" 
                        style={{ background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}
                        onClick={() => navigate(`/builds/${build.id}`)}
                    >
                        <Group gap="xs" mb={4}>
                             <Avatar src={build.game_icon} size="xs" />
                             <Text size="xs" fw={700} lineClamp={1}>{build.build_name}</Text>
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={1}>by {build.username}</Text>
                    </Paper>
                ))}
                {displayBuilds.length === 0 && <Text size="xs" c="dimmed">No trending builds yet.</Text>}
            </SimpleGrid>
        </WidgetWrapper>
    );
};

// --- 9. Solo Bingo Widget (1x1) ---
export const SoloBingoWidget = () => {
    const navigate = useNavigate();
    return (
        <WidgetWrapper onClick={() => navigate('/bingo-challenges')} delay={0.4}>
             <Stack justify="space-between" h="100%">
                <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'teal', to: 'lime' }}>
                    <IconDeviceGamepad2 size={24} />
                </ThemeIcon>
                <div>
                    <Text fw={700} size="lg">Solo Bingo</Text>
                    <Text size="xs" c="dimmed">Quick Play</Text>
                </div>
            </Stack>
        </WidgetWrapper>
    );
};

// --- 10. Leaderboard Podium Widget (1x1) ---
export const LeaderboardPodiumWidget = ({ topPlayers }: { topPlayers: any[] }) => {
    const navigate = useNavigate();
    const top1 = topPlayers[0];

    return (
        <WidgetWrapper onClick={() => navigate('/leaderboard')} delay={0.45}>
             <Stack justify="space-between" h="100%">
                <Group justify="space-between">
                     <ThemeIcon size="md" radius="xl" color="yellow" variant="filled">
                        <IconTrophy size={14} />
                     </ThemeIcon>
                     <Text size="xs" fw={700} c="yellow">#1 Leader</Text>
                </Group>
                
                {top1 ? (
                    <Stack gap={4} align="center">
                        <Avatar src={top1.avatar_url} size="md" radius="xl" style={{ border: '2px solid #FFD700' }} />
                        <Text fw={700} size="sm" lineClamp={1}>{top1.username}</Text>
                        <Text size="xs" c="dimmed">{top1.points} pts</Text>
                    </Stack>
                ) : (
                    <Text size="xs" c="dimmed">No data</Text>
                )}
            </Stack>
        </WidgetWrapper>
    );
};
