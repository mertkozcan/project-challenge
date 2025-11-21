import React, { useEffect, useState } from 'react';
import { Grid, Title, Divider, Container, Button, Group, Text, ThemeIcon, Badge } from '@mantine/core';
import { IconTrophy, IconFlame, IconNewSection, IconSword, IconGridDots, IconBolt } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import PopularChallengeCard from '../../components/Cards/PopularChallengeCard';
import NewChallengesCard from '@/components/Cards/NewChallengesCard';
import ChallengeOfTheWeek from '@/components/Cards/ChallengeOfTheWeekCard';
import SloganSection from '@/components/Dashboard/SloganSection';
import BuildChallenges from '@/components/Cards/BuildChallenges';
import BingoChallenges from '@/components/Cards/BingoChallenges';

import { ChallengesService } from '../../services/challenges/challenges.service';
import { BuildsService } from '../../services/builds/builds.service';
import { BingoService } from '../../services/bingo/bingo.service';
import { LeaderboardService } from '../../services/leaderboard/leaderboard.service';
import { Challenge } from '@/@types/challenge';
import { useAppSelector } from '@/store';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [latestChallenges, setLatestChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAppSelector((state) => state.auth.user);

  const [popularChallenge, setPopularChallenge] = useState<any>(null);
  const [challengeOfTheWeek, setChallengeOfTheWeek] = useState<any>(null);
  const [buildChallenges, setBuildChallenges] = useState<any[]>([]);
  const [bingoChallenges, setBingoChallenges] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
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
        // Map to component format
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
        // Map to component format
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
  }, []);

  return (
    <Container size="xl" py="xl">
      {/* Hero / Slogan Section */}
      <div style={{ marginBottom: '40px' }}>
        <SloganSection />
      </div>

      {/* Challenge Me Button */}
      <Group justify="center" mb="xl">
        <Button
          leftSection={<IconBolt size={24} />}
          size="xl"
          radius="xl"
          variant="gradient"
          gradient={{ from: 'orange', to: 'red', deg: 45 }}
          onClick={async () => {
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

      {/* Featured Section: Challenge of the Week & Popular */}
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

      <Divider my="xl" label={<IconGridDots size={16} />} labelPosition="center" />

      {/* New Challenges */}
      <section style={{ marginBottom: '50px' }}>
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
      </section>

      {/* Explore Section: Builds & Bingo */}
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
    </Container>
  );
};

export default Dashboard;
