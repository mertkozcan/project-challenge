import React, { useEffect, useState } from 'react';
import { Container, Title, Text, Button, Group, Box } from '@mantine/core';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import useAuth from '@/utils/hooks/useAuth';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { UserStatsService } from '@/services/userStats/userStats.service';
import { BuildsService } from '@/services/builds/builds.service';
import { BingoRoomService } from '@/services/bingo/bingoRoom.service';
import {
  ChallengeSpotlightWidget,
  UserProgressWidget,
  QuickCreateWidget,
  QuickBingoWidget,
  LivePulseWidget,
  StatsOverviewWidget,
  FeaturedBuildWidget
} from '@/components/Dashboard/DashboardWidgets';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const user = useAppSelector((state) => state.auth.userInfo);

  const [loading, setLoading] = useState(true);
  const [challengeOfTheDay, setChallengeOfTheDay] = useState<any>(null);
  const [featuredBuild, setFeaturedBuild] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>({
    completedChallenges: 0,
    activeChallenges: 0,
    points: 0,
  });
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [activeRoomCount, setActiveRoomCount] = useState<number>(0);
  const [totalChallenges, setTotalChallenges] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Challenge of the Day
        const challenges = await ChallengesService.getChallenges('daily', 'official');
        if (challenges.length > 0) {
          setChallengeOfTheDay({
             ...challenges[0],
             gameImage: challenges[0].banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
          });
        } else {
            const all = await ChallengesService.getChallenges();
            if (all.length > 0) {
                 setChallengeOfTheDay({
                    ...all[0],
                    gameImage: all[0].banner_url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'
                 });
            }
        }
        
        // Total Challenges Count (for Quick Create)
        const allChallenges = await ChallengesService.getChallenges();
        setTotalChallenges(allChallenges.length);

        // 2. Featured Build (Random Official Build)
        const officialBuilds = await BuildsService.getBuilds('official');
        if (officialBuilds.length > 0) {
            const randomBuild = officialBuilds[Math.floor(Math.random() * officialBuilds.length)];
            setFeaturedBuild(randomBuild);
        }

        // 3. User Stats
        if (userId && authenticated) {
          try {
            const stats = await UserStatsService.getUserStats(userId);
            setUserStats(stats);
          } catch (e) {
            console.error("Failed to fetch user stats", e);
          }
        }

        // 4. Active Bingo Rooms
        try {
            const rooms = await BingoRoomService.getAvailableRooms();
            setActiveRoomCount(rooms.length);
        } catch (e) {
            console.error("Failed to fetch bingo rooms", e);
        }

        // 5. Live Activity (Real Data: Latest Challenges + Builds)
        const latestChallenges = await ChallengesService.getLatestChallenges();
        const latestBuilds = await BuildsService.getBuilds(); // Assuming this returns latest first or we sort
        
        // Normalize and merge
        const activityItems = [
            ...latestChallenges.slice(0, 3).map((c: any) => ({
                type: 'challenge',
                title: c.challenge_name,
                user: c.creator_username || 'Unknown',
                time: new Date(c.created_at).toLocaleDateString(), // Simplified time
                timestamp: new Date(c.created_at).getTime()
            })),
            ...latestBuilds.slice(0, 3).map((b: any) => ({
                type: 'build',
                title: b.build_name,
                user: b.username || 'Unknown',
                time: new Date(b.created_at).toLocaleDateString(),
                timestamp: new Date(b.created_at).getTime()
            }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

        setLiveActivity(activityItems);

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
          {/* 1. Challenge Spotlight (2x2) */}
          <Box style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
             <ChallengeSpotlightWidget challenge={challengeOfTheDay} loading={loading} />
          </Box>

          {/* 2. User Progress (1x1) or Sign In Callout */}
          <Box style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
            {authenticated ? (
              <UserProgressWidget stats={userStats} user={user} />
            ) : (
               <QuickCreateWidget totalChallenges={totalChallenges} />
            )}
          </Box>

          {/* 3. Quick Action: Bingo (1x1) */}
          <Box style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
            <QuickBingoWidget activeRooms={activeRoomCount} />
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
          
           {/* 6. Featured Build (1x1) - Replaces Quick Create if authenticated, or added elsewhere */}
           {authenticated && (
              <Box style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
                <FeaturedBuildWidget build={featuredBuild} />
              </Box>
           )}

        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
