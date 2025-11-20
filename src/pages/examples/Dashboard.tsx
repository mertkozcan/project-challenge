import React, { useEffect, useState } from 'react';
import { Grid, Title, Divider, Container, Button, Group, Text, Paper, ThemeIcon, SimpleGrid, Badge } from '@mantine/core';
import { IconTrophy, IconFlame, IconNewSection, IconSword, IconGridDots, IconPlus, IconBolt } from '@tabler/icons-react';
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
import { Challenge } from '@/@types/challenge';
import { useAppSelector } from '@/store';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [latestChallenges, setLatestChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAppSelector((state) => state.auth.user);
  const isAuthenticated = !!role;

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
             // Mock leaderboard for now as we don't have real user data for it yet
             const cotwLeaderboard = [
                { name: 'PlayerOne', time: 300 },
                { name: 'MageMaster', time: 340 },
                { name: 'BossSlayer', time: 390 },
              ];
            setChallengeOfTheWeek({ ...challenges[0], leaderboard: cotwLeaderboard });
        }

        // 3. Popular Challenge (Mock logic: just pick a random permanent official challenge)
        const permChallenges = await ChallengesService.getChallenges('permanent', 'official');
        if (permChallenges.length > 0) {
            // Mock leaderboard
             const popLeaderboard = [
                { avatar: 'https://example.com/user1.jpg', name: 'PlayerOne', time: 1200 },
                { avatar: 'https://example.com/user2.jpg', name: 'MageMaster', time: 1100 },
                { avatar: 'https://example.com/user3.jpg', name: 'BossSlayer', time: 1000 },
              ];
            // Need game image. Fetch game info? Or just use a placeholder/lookup.
            // For now, let's assume we can get it or hardcode a mapping based on game name.
            // A better way is to join games table in backend, but for now let's map it.
            const gameImages: any = {
                'Elden Ring': 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1726158298',
                'Fallout 4': 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3ccd3cde-f8c0-480c-ab9d-4db767bda944/dc0qed1-b0a282de-11cc-4844-b601-241b94f6de9b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzNjY2QzY2RlLWY4YzAtNDgwYy1hYjlkLTRkYjc2N2JkYTk0NFwvZGMwcWVkMS1iMGEyODJkZS0xMWNjLTQ4NDQtYjYwMS0yNDFiOTRmNmRlOWIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.0hqnm3A02kq-bPK5UCSumoHiKseVa-QJH-paxA2dn3Y',
            };
            setPopularChallenge({ 
                ...permChallenges[0], 
                gameImage: gameImages[permChallenges[0].game_name] || 'https://placehold.co/600x400',
                leaderboard: popLeaderboard 
            });
        }

        // 4. Featured Builds (Official)
        // We need a service method for this. Assuming BuildsService.getBuilds('official') works.
        // Wait, BuildsService.getBuilds takes (contentType, game).
        // Let's import BuildsService.
        // 4. Featured Builds (Official)
        // We need a service method for this. Assuming BuildsService.getBuilds('official') works.
        // Wait, BuildsService.getBuilds takes (contentType, game).
        // Let's import BuildsService.
        const builds = await BuildsService.getBuilds('official');
        // Map to component format
        const mappedBuilds = builds.map((b: any) => ({
            id: b.id,
            gameImage: 'https://placehold.co/600x400', // Placeholder for now, or map like above
            gameName: b.game_name,
            buildName: b.build_name,
            description: b.description
        }));
        // Update images manually for demo
        const gameImages: any = {
             'Fallout 4': 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3ccd3cde-f8c0-480c-ab9d-4db767bda944/dc0qed1-b0a282de-11cc-4844-b601-241b94f6de9b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzNjY2QzY2RlLWY4YzAtNDgwYy1hYjlkLTRkYjc2N2JkYTk0NFwvZGMwcWVkMS1iMGEyODJkZS0xMWNjLTQ4NDQtYjYwMS0yNDFiOTRmNmRlOWIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.0hqnm3A02kq-bPK5UCSumoHiKseVa-QJH-paxA2dn3Y',
             'The Elder Scrolls V: Skyrim': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHWS3TCWOCd-df-P4O48JC76fk9Byp8uje5w&s',
             'Cyberpunk 2077': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQueQFtpY8c-MiiP0xR36ItyR_x_Ef-igWcdw&s',
             'Dark Souls 3': 'https://cdn2.steamgriddb.com/hero_thumb/2181d94fba9a1d2de2b5f6fb75f8ab08.jpg'
        };
        setBuildChallenges(mappedBuilds.map(b => ({ ...b, gameImage: gameImages[b.gameName] || b.gameImage })));


        // 5. Bingo Challenges
        // Need BingoService.
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
      <Grid gutter="xl" mb={50}>
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
