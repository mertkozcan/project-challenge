import React, { useEffect, useState } from 'react';
import { Grid, Title, Divider, Container, Button, Group, Text, ThemeIcon, Badge, SimpleGrid, Paper } from '@mantine/core';
import { 
  IconTrophy, IconFlame, IconNewSection, IconSword, IconGridDots, IconBolt,
  IconTarget, IconClock, IconStar, IconUsers, IconRocket, IconPlus,
  IconChartBar, IconBrandDiscord
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PopularChallengeCard from '../../components/Cards/PopularChallengeCard';
import NewChallengesCard from '@/components/Cards/NewChallengesCard';
import ChallengeOfTheWeek from '@/components/Cards/ChallengeOfTheWeekCard';
import SloganSection from '@/components/Dashboard/SloganSection';
import BuildChallenges from '@/components/Cards/BuildChallenges';
import BingoChallenges from '@/components/Cards/BingoChallenges';
import StatsCard from '@/components/Dashboard/StatsCard';
import QuickActionCard from '@/components/Dashboard/QuickActionCard';

import { ChallengesService } from '../../services/challenges/challenges.service';
import { BuildsService } from '../../services/builds/builds.service';
import { BingoService } from '../../services/bingo/bingo.service';
import { LeaderboardService } from '../../services/leaderboard/leaderboard.service';
import { UserStatsService, UserStats } from '../../services/userStats/userStats.service';
import { Challenge } from '@/@types/challenge';
import { useAppSelector } from '@/store';
import useAuth from '@/utils/hooks/useAuth';
import { useTour } from '@/components/Tutorial/TourProvider';
import TourButton from '@/components/Tutorial/TourButton';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [latestChallenges, setLatestChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAppSelector((state) => state.auth.user);
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const { authenticated } = useAuth();

  const [popularChallenge, setPopularChallenge] = useState<any>(null);
  const [challengeOfTheWeek, setChallengeOfTheWeek] = useState<any>(null);
  const [buildChallenges, setBuildChallenges] = useState<any[]>([]);
  const [bingoChallenges, setBingoChallenges] = useState<any[]>([]);
  
  // User stats from API
  const [userStats, setUserStats] = useState<UserStats>({
    completedChallenges: 0,
    activeChallenges: 0,
    createdBuilds: 0,
    points: 0,
    globalRank: null,
    completedBingos: 0,
    activeBingos: 0,
  });

  const { startTour, completedTours } = useTour();

  // Auto-start tour on first visit
  useEffect(() => {
    const hasSeenDashboardTour = localStorage.getItem('dashboard_tour_seen');
    if (!hasSeenDashboardTour && authenticated) {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        startTour('dashboard');
        localStorage.setItem('dashboard_tour_seen', 'true');
      }, 1000);
    }
  }, [authenticated, startTour]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user stats only if logged in
        if (userId && authenticated) {
          try {
            const stats = await UserStatsService.getUserStats(userId);
            setUserStats(stats);
          } catch (error) {
            console.error('Failed to fetch user stats:', error);
          }
        }
        
        // 1. Latest Community Challenges
        const latest = await ChallengesService.getLatestChallenges();
        setLatestChallenges(latest);

        // 2. Challenge of the Week (Type: weekly)
        const challenges = await ChallengesService.getChallenges('weekly', 'official');
        if (challenges.length > 0) {
             const cotw = challenges[0];
             let leaderboardData: any[] = [];
             try {
                const rankings = await LeaderboardService.getChallengeRankings(String(cotw.id));
                leaderboardData = rankings.rankings.slice(0, 3).map(r => ({
                    name: r.username,
                    score: r.score
                }));
             } catch (e) {
                 console.error("Failed to fetch COTW leaderboard", e);
             }
             setChallengeOfTheWeek({ ...cotw, leaderboard: leaderboardData });
        }

        // 3. Popular Challenge (Based on participation count)
        const popularChallenges = await ChallengesService.getPopularChallenges(1);
        if (popularChallenges.length > 0) {
            const popChallenge = popularChallenges[0];
            let popLeaderboard: any[] = [];
             try {
                const rankings = await LeaderboardService.getChallengeRankings(String(popChallenge.id));
                popLeaderboard = rankings.rankings.slice(0, 3).map(r => ({
                    name: r.username,
                    score: r.score
                }));
             } catch (e) {
                 console.error("Failed to fetch Popular Challenge leaderboard", e);
             }
            
            setPopularChallenge({ 
                ...popChallenge, 
                gameImage: popChallenge.banner_url || 'https://placehold.co/600x400',
                leaderboard: popLeaderboard 
            });
        }

        // 4. Featured Builds (Official)
        const builds = await BuildsService.getBuilds('official');
        const mappedBuilds = builds.map((b: any) => ({
            id: b.id,
            gameImage: b.banner_url || 'https://placehold.co/600x400',
            gameName: b.game_name,
            buildName: b.build_name,
            description: b.description
        }));
        setBuildChallenges(mappedBuilds);

        // 5. Bingo Challenges
        const bingos = await BingoService.getBoards();
        const mappedBingos = bingos.map((b: any) => ({
            id: b.id,
            gameName: b.game_name,
            challengeName: b.title,
            description: b.description
        }));
        setBingoChallenges(mappedBingos);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, authenticated]);

  const handleAction = (action: () => void) => {
    if (!authenticated) {
      navigate('/sign-in');
    } else {
      action();
    }
  };

  return (
    <Container size="xl" py="xl">
      {/* Hero / Slogan Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '40px' }}
      >
        <SloganSection />
      </motion.div>

      {/* User Stats Section or Guest Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {authenticated ? (
          <>
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                <IconChartBar size={20} />
              </ThemeIcon>
              <Title order={2}>Your Progress</Title>
            </Group>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg" mb="xl">
              <StatsCard
                title="Completed Challenges"
                value={userStats.completedChallenges}
                icon={<IconTarget size={24} />}
                color="green"
                description="Keep up the great work!"
                onClick={() => navigate('/challenges')}
              />
              <StatsCard
                title="Active Challenges"
                value={userStats.activeChallenges}
                icon={<IconClock size={24} />}
                color="orange"
                description="In progress"
                badge="Live"
                onClick={() => navigate('/challenges')}
              />
              <StatsCard
                title="Total Points"
                value={userStats.points}
                icon={<IconStar size={24} />}
                color="yellow"
                description="Earned from challenges"
              />
              <StatsCard
                title="Global Rank"
                value={userStats.globalRank ? `#${userStats.globalRank}` : 'Unranked'}
                icon={<IconTrophy size={24} />}
                color="grape"
                description="Your position"
                onClick={() => navigate('/leaderboard')}
              />
            </SimpleGrid>
          </>
        ) : (
          <Paper p="xl" radius="md" withBorder mb="xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <Group justify="space-between" align="center">
              <div>
                <Title order={2} mb="xs">Welcome to Project Challenge!</Title>
                <Text c="dimmed">Join the community to track your progress, create challenges, and play multiplayer bingo.</Text>
              </div>
              <Group>
                <Button variant="default" size="lg" onClick={() => navigate('/sign-in')}>Sign In</Button>
                <Button size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} onClick={() => navigate('/sign-up')}>Sign Up</Button>
              </Group>
            </Group>
          </Paper>
        )}
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Group mb="md">
          <ThemeIcon size="lg" radius="md" variant="light" color="violet">
            <IconRocket size={20} />
          </ThemeIcon>
          <Title order={2}>Quick Actions</Title>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mb="xl">
          <QuickActionCard
            title="Create Challenge"
            description="Share your own challenge with the community"
            icon={<IconPlus size={20} />}
            color="blue"
            onClick={() => handleAction(() => navigate('/challenges/create'))}
          />
          <QuickActionCard
            title="Join Bingo Room"
            description="Play multiplayer bingo with friends"
            icon={<IconUsers size={20} />}
            color="grape"
            badge="Live"
            onClick={() => handleAction(() => navigate('/bingo/rooms'))}
          />
          <QuickActionCard
            title="View Leaderboard"
            description="See top players and your ranking"
            icon={<IconTrophy size={20} />}
            color="yellow"
            onClick={() => navigate('/leaderboard')}
          />
        </SimpleGrid>
      </motion.div>

      {/* Challenge Me Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Group justify="center" mb="xl">
          <Button
            leftSection={<IconBolt size={24} />}
            size="xl"
            radius="xl"
            variant="gradient"
            gradient={{ from: 'orange', to: 'red', deg: 45 }}
            onClick={async () => {
              if (!authenticated) {
                navigate('/sign-in');
                return;
              }
              try {
                const allChallenges = await ChallengesService.getChallenges();
                if (allChallenges.length > 0) {
                  const randomChallenge = allChallenges[Math.floor(Math.random() * allChallenges.length)];
                  navigate(`/challenges/${randomChallenge.id}`);
                }
              } catch (error) {
                console.error('Error fetching challenges:', error);
              }
            }}
            style={{ 
              boxShadow: '0 8px 24px rgba(255, 87, 34, 0.4)',
              fontSize: '1.2rem',
              fontWeight: 700,
              padding: '2rem 3rem',
              minWidth: '300px',
              height: 'auto',
              lineHeight: '1.5',
            }}
          >
            Challenge Me!
          </Button>
        </Group>
      </motion.div>

      {/* Featured Section: Challenge of the Week & Popular */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Grid gutter="xl" mb={50} align="stretch">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="yellow">
                <IconTrophy size={20} />
              </ThemeIcon>
              <Title order={2}>Challenge of the Week</Title>
              <Badge color="red" variant="light">Limited Time</Badge>
            </Group>
            {challengeOfTheWeek ? (
              <ChallengeOfTheWeek
                  challengeId={challengeOfTheWeek.id}
                  gameName={challengeOfTheWeek.game_name}
                  challengeName={challengeOfTheWeek.challenge_name}
                  description={challengeOfTheWeek.description}
                  reward={challengeOfTheWeek.reward}
                  leaderboard={challengeOfTheWeek.leaderboard}
                  loading={loading}
              />
            ) : (
              <Text>No weekly challenge available.</Text>
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                <IconFlame size={20} />
              </ThemeIcon>
              <Title order={2}>Popular Now</Title>
            </Group>
            {popularChallenge ? (
               <PopularChallengeCard 
                  challengeId={popularChallenge.id}
                  gameImage={popularChallenge.gameImage}
                  gameName={popularChallenge.game_name}
                  challengeName={popularChallenge.challenge_name}
                  description={popularChallenge.description}
                  leaderboard={popularChallenge.leaderboard}
                  loading={loading} 
               />
            ) : (
              <Text>No popular challenges.</Text>
            )}
          </Grid.Col>
        </Grid>
      </motion.div>

      <Divider my="xl" label={<IconGridDots size={16} />} labelPosition="center" />

      {/* New Challenges */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ marginBottom: '50px' }}
      >
        <Group mb="xl" justify="space-between">
          <Group>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconNewSection size={20} />
            </ThemeIcon>
            <Title order={2}>New Community Challenges</Title>
          </Group>
          <Button variant="subtle" onClick={() => navigate('/challenges')}>View All</Button>
        </Group>
        <NewChallengesCard challenges={latestChallenges} loading={loading} />
      </motion.section>

      {/* Explore Section: Builds & Bingo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                <IconSword size={20} />
              </ThemeIcon>
              <Title order={2}>Featured Builds</Title>
            </Group>
            <BuildChallenges builds={buildChallenges} loading={loading} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="grape">
                <IconGridDots size={20} />
              </ThemeIcon>
              <Title order={2}>Bingo Challenges</Title>
            </Group>
            <BingoChallenges challenges={bingoChallenges} loading={loading} />
          </Grid.Col>
        </Grid>
      </motion.div>

      {/* Tour Help Button */}
      <TourButton tourType="dashboard" />
    </Container>
  );
};

export default Dashboard;
