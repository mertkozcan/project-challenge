import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Tabs,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  LoadingOverlay,
  Group,
} from '@mantine/core';
import { ChallengesService } from '@/services/challenges/challenges.service';
import type { Challenge } from '@/@types/challenge';
import { IconPlus, IconTrophy, IconUsers } from '@tabler/icons-react';

const Challenges: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('official');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
  }, [activeTab]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await ChallengesService.getChallenges(undefined, activeTab === 'official' ? 'official' : 'community');
      setChallenges(data);
    } catch (error) {
      console.error('Failed to fetch challenges', error);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'green';
      case 'weekly': return 'blue';
      case 'permanent': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Challenges</Title>
        {activeTab === 'community' && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/challenges/create')}>
            Create Challenge
          </Button>
        )}
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="official" leftSection={<IconTrophy size={16} />}>
            Official
          </Tabs.Tab>
          <Tabs.Tab value="community" leftSection={<IconUsers size={16} />}>
            Community
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="official" pt="md">
          {loading ? (
            <LoadingOverlay visible={true} />
          ) : (
            <Grid>
              {challenges.map((challenge) => (
                <Grid.Col key={challenge.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card shadow="sm" padding="lg" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate(`/challenges/${challenge.id}`)}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={700}>{challenge.challenge_name}</Text>
                      <Badge color={getChallengeTypeColor(challenge.type)}>
                        {challenge.type.toUpperCase()}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mb="xs">
                      {challenge.game_name}
                    </Text>
                    <Text size="sm" lineClamp={2} mb="md">
                      {challenge.description}
                    </Text>
                    <Text size="sm" c="yellow" fw={700}>
                      Reward: {challenge.reward}
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
          {!loading && challenges.length === 0 && (
            <Text c="dimmed" ta="center" mt="xl">No official challenges yet.</Text>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="community" pt="md">
          {loading ? (
            <LoadingOverlay visible={true} />
          ) : (
            <Grid>
              {challenges.map((challenge) => (
                <Grid.Col key={challenge.id} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card shadow="sm" padding="lg" withBorder style={{ cursor: 'pointer' }} onClick={() => navigate(`/challenges/${challenge.id}`)}>
                    <Group justify="space-between" mb="xs">
                      <Text fw={700}>{challenge.challenge_name}</Text>
                      <Badge color={getChallengeTypeColor(challenge.type)}>
                        {challenge.type.toUpperCase()}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mb="xs">
                      {challenge.game_name}
                    </Text>
                    <Text size="sm" lineClamp={2} mb="md">
                      {challenge.description}
                    </Text>
                    <Text size="sm" c="yellow" fw={700}>
                      Reward: {challenge.reward}
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
          {!loading && challenges.length === 0 && (
            <Text c="dimmed" ta="center" mt="xl">No community challenges yet. Be the first to create one!</Text>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Challenges;