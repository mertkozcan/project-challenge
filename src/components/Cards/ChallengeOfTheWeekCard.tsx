import React from 'react';
import { Card, Text, Table, Button, Group, Badge, Skeleton, Grid } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  name: string; // Oyuncu adı
  score: number; // Puan
}

interface ChallengeOfTheWeekProps {
  challengeId: number; // Challenge ID
  gameName: string; // Oyun adı
  challengeName: string; // Challenge adı
  description: string; // Challenge açıklaması
  reward: string; // Ödül
  leaderboard: LeaderboardEntry[]; // Liderlik tablosu
  loading: boolean;
}

const ChallengeOfTheWeek: React.FC<ChallengeOfTheWeekProps> = ({
  challengeId,
  gameName,
  challengeName,
  description,
  reward,
  leaderboard,
  loading,
}) => {
  const navigate = useNavigate();
  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      h={'100%'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        background: 'linear-gradient(145deg, #1e1e2e, #151515)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {loading ? (
        <div>
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} />
        </div>
      ) : (
        <Grid h="100%" align="stretch">
          <Grid.Col span={{ base: 12, md: 7 }} style={{ display: 'flex', flexDirection: 'column' }}>
            <Group justify="space-between" mb="md" align="center">
              <Badge color="green" size="lg" variant="light">
                Reward: {reward}
              </Badge>
              <Badge color="grape" variant="filled" size="lg" radius="sm">
                {gameName}
              </Badge>
            </Group>

            <Text
              size="xl"
              fw={900}
              variant="gradient"
              gradient={{ from: 'yellow', to: 'orange', deg: 45 }}
              mb="xs"
            >
              CHALLENGE OF THE WEEK
            </Text>

            <Text fw={700} size="2rem" lh={1.2} mb="md" style={{ color: '#fff' }}>
              {challengeName}
            </Text>
            
            <Text size="md" color="gray.4" mb="xl" style={{ flexGrow: 1 }}>
              {description}
            </Text>

            <Button 
              variant="gradient" 
              gradient={{ from: 'yellow', to: 'orange', deg: 45 }}
              size="lg"
              fullWidth 
              onClick={() => navigate(`/challenges/${challengeId}`)}
              leftSection={<IconTrophy size={20} />}
              style={{ marginTop: 'auto' }}
            >
              Join the Challenge
            </Button>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card 
              bg="rgba(0,0,0,0.3)" 
              radius="md" 
              p="md" 
              h="100%" 
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Text fw={700} size="lg" mb="md" ta="center" c="yellow.4">
                Top Performers
              </Text>
              
              <div style={{ overflowY: 'auto' }}>
                <Table verticalSpacing="sm" withRowBorders={false}>
                  <thead>
                    <tr>
                      <th style={{ color: '#888' }}>Rank</th>
                      <th style={{ color: '#888' }}>User</th>
                      <th style={{ color: '#888', textAlign: 'right' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length > 0 ? (
                      leaderboard.map((player, index) => (
                        <tr key={index}>
                          <td>
                            {index < 3 ? (
                              <IconTrophy
                                size={20}
                                color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                              />
                            ) : (
                              <Text c="dimmed" fw={500}>#{index + 1}</Text>
                            )}
                          </td>
                          <td>
                            <Text fw={500} c="white">{player.name}</Text>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Text fw={700} c="yellow.2">{player.score}</Text>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3}>
                          <Text c="dimmed" ta="center" py="xl">
                            No records yet. Be the first!
                          </Text>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </Card>
  );
};

export default ChallengeOfTheWeek;
