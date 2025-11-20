import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  Group,
  Avatar,
  Text,
  Badge,
  Grid,
  Card,
  Stack,
  Timeline,
  LoadingOverlay,
  RingProgress,
  Center,
} from '@mantine/core';
import { UserService, type ProfileData } from '@/services/user/user.service';
import { 
  IconTrophy, 
  IconTarget, 
  IconSword, 
  IconClock, 
  IconMedal,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

const UserProfile: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const profileData = await UserService.getProfile(id!);
      setData(profileData);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay visible={true} />;
  if (!data) return <Text>User not found</Text>;

  const { profile, stats, rank, recentActivity } = data;

  // Calculate completion rate
  const totalAttempts = stats.completed_challenges + stats.pending_proofs;
  const completionRate = totalAttempts > 0 
    ? Math.round((stats.completed_challenges / totalAttempts) * 100) 
    : 0;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'proof': return <IconTarget size={16} />;
      case 'build': return <IconSword size={16} />;
      case 'challenge': return <IconTrophy size={16} />;
      default: return <IconClock size={16} />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'PENDING': return 'yellow';
      case 'REJECTED': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Container size="xl" py="xl">
      {/* Header Section */}
      <Paper shadow="sm" p="xl" mb="xl" withBorder>
        <Group>
          <Avatar 
            src={profile.avatar_url} 
            size={120} 
            radius={120}
            alt={profile.username}
          />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Group>
              <Title order={2}>{profile.username}</Title>
              {rank && rank <= 10 && (
                <Badge size="lg" color="yellow" leftSection={<IconMedal size={16} />}>
                  Rank #{rank}
                </Badge>
              )}
            </Group>
            <Text c="dimmed">{profile.email}</Text>
            <Group gap="xl" mt="md">
              <div>
                <Text size="xl" fw={700} c="yellow">{stats.total_points}</Text>
                <Text size="sm" c="dimmed">Total Points</Text>
              </div>
              {rank && (
                <div>
                  <Text size="xl" fw={700}>#{rank}</Text>
                  <Text size="sm" c="dimmed">Global Rank</Text>
                </div>
              )}
              <div>
                <Text size="xl" fw={700}>{stats.completed_challenges}</Text>
                <Text size="sm" c="dimmed">Completed</Text>
              </div>
            </Group>
          </Stack>
        </Group>
      </Paper>

      <Grid>
        {/* Stats Cards */}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm">Challenges Completed</Text>
                <Text size="xl" fw={700}>{stats.completed_challenges}</Text>
              </div>
              <IconTrophy size={40} color="green" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm">Pending Proofs</Text>
                <Text size="xl" fw={700}>{stats.pending_proofs}</Text>
              </div>
              <IconClock size={40} color="orange" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm">Builds Created</Text>
                <Text size="xl" fw={700}>{stats.created_builds}</Text>
              </div>
              <IconSword size={40} color="blue" />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="sm">Challenges Created</Text>
                <Text size="xl" fw={700}>{stats.created_challenges}</Text>
              </div>
              <IconTarget size={40} color="purple" />
            </Group>
          </Card>
        </Grid.Col>

        {/* Completion Rate */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={700} mb="md">Completion Rate</Text>
            <Center>
              <RingProgress
                size={180}
                thickness={16}
                sections={[{ value: completionRate, color: 'teal' }]}
                label={
                  <Center>
                    <div style={{ textAlign: 'center' }}>
                      <Text size="xl" fw={700}>{completionRate}%</Text>
                      <Text size="xs" c="dimmed">Success Rate</Text>
                    </div>
                  </Center>
                }
              />
            </Center>
          </Card>
        </Grid.Col>

        {/* Recent Activity */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Text fw={700} mb="md">Recent Activity</Text>
            <Timeline active={-1} bulletSize={24} lineWidth={2}>
              {recentActivity.slice(0, 5).map((activity, index) => (
                <Timeline.Item
                  key={index}
                  bullet={getActivityIcon(activity.type)}
                  title={
                    <Group gap="xs">
                      <Text size="sm" fw={500}>{activity.title}</Text>
                      <Badge size="xs" color={getActivityColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </Group>
                  }
                >
                  <Text size="xs" c="dimmed">{activity.game_name}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
            {recentActivity.length === 0 && (
              <Text c="dimmed" ta="center">No recent activity</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default UserProfile;
