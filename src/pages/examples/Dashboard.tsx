import React, { useEffect, useState } from 'react';
import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import useAuth from '@/utils/hooks/useAuth';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { UserStatsService } from '@/services/userStats/userStats.service';
import {
  ChallengeSpotlightWidget,
  UserProgressWidget,
  QuickCreateWidget,
  QuickBingoWidget,
  LivePulseWidget,
  StatsOverviewWidget
} from '@/components/Dashboard/DashboardWidgets';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const user = useAppSelector((state) => state.auth.userInfo); // Assuming userInfo has level/xp

  const [loading, setLoading] = useState(true);
  const [challengeOfTheDay, setChallengeOfTheDay] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>({
    completedChallenges: 0,
    activeChallenges: 0,
    points: 0,
  });
  const [liveActivity, setLiveActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Challenge of the Day (Random or specific logic)
        const challenges = await ChallengesService.getChallenges('daily', 'official');
        if (challenges.length > 0) {
          setChallengeOfTheDay({
             ...challenges[0],
             gameImage: challenges[0].banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80' // Placeholder if no image
          });
        } else {
            // Fallback to any challenge
            const all = await ChallengesService.getChallenges();
            if (all.length > 0) {
                 setChallengeOfTheDay({
                    ...all[0],
                    gameImage: all[0].banner_url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
                 });
            }
        }

        // 2. User Stats
        if (userId && authenticated) {
          try {
            const stats = await UserStatsService.getUserStats(userId);
            setUserStats(stats);
          } catch (e) {
            console.error("Failed to fetch user stats", e);
          }
        }

        // 3. Mock Live Activity (Replace with real socket data later)
        setLiveActivity([
          { user: 'DarkSoul99', action: 'Completed "No Hit Run"', time: '2m ago', avatar: null },
          { user: 'EldenLord', action: 'Joined Bingo Room #42', time: '5m ago', avatar: null },
          { user: 'MageBuilds', action: 'Created "Glass Cannon"', time: '12m ago', avatar: null },
        ]);

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, authenticated]);

  return (
    <Box style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Immersive Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '60vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(60, 20, 100, 0.4) 0%, rgba(10, 10, 12, 0) 70%)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Group justify="space-between" mb={40} align="flex-end">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Text size="lg" c="dimmed" mb={4}>
              {authenticated ? `Welcome back, ${user?.username || 'Hunter'}` : 'Welcome to Project Challenge'}
            </Text>
            <Title order={1} style={{ fontSize: '3rem', letterSpacing: '-1px' }}>
              {authenticated ? 'Ready for your next run?' : 'Master the Challenge.'}
            </Title>
          </motion.div>
          
          {!authenticated && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Button size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} onClick={() => navigate('/sign-up')}>
                Join the Elite
              </Button>
            </motion.div>
          )}
        </Group>

        {/* Bento Grid Layout */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridAutoRows: 'minmax(180px, auto)',
            gap: '24px',
          }}
        >
          {/* Mobile/Tablet adjustments handled via media queries in CSS or simple conditional rendering if needed. 
              For simplicity, we assume a responsive grid container or use Mantine's SimpleGrid for mobile fallback if strictly needed, 
              but CSS Grid is robust. Here we use inline styles for the grid structure.
          */}
          
          {/* 1. Challenge Spotlight (2x2) */}
          <Box style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
             <ChallengeSpotlightWidget challenge={challengeOfTheDay} loading={loading} />
          </Box>

          {/* 2. User Progress (1x1) or Sign In Callout */}
          <Box style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
            {authenticated ? (
              <UserProgressWidget stats={userStats} user={user} />
            ) : (
               <QuickCreateWidget /> // Fallback for guest
            )}
          </Box>

          {/* 3. Quick Action: Bingo (1x1) */}
          <Box style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
            <QuickBingoWidget />
          </Box>

          {/* 4. Live Pulse (1x2) */}
          <Box style={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
            <LivePulseWidget activities={liveActivity} />
          </Box>

          {/* 5. Stats Overview (2x1) */}
          {authenticated && (
             <Box style={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
                <StatsOverviewWidget stats={userStats} />
             </Box>
          )}
          
           {/* 6. Quick Action: Create (1x1) - If not shown above */}
           {authenticated && (
              <Box style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
                <QuickCreateWidget />
              </Box>
           )}

        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
