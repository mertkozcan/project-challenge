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
  Stack,
  LoadingOverlay,
  SimpleGrid,
  Box,
  Button,
  ActionIcon,
} from '@mantine/core';
import { UserService, type ProfileData } from '@/services/user/user.service';
import { UserStatsService, type UserBuild } from '@/services/userStats/userStats.service';
import { 
  IconTrophy, 
  IconSword, 
  IconMedal,
  IconStar,
  IconArrowRight,
  IconEdit,
} from '@tabler/icons-react';
import StatsCard from '@/components/Profile/StatsCard';
import ActivityTimeline from '@/components/Profile/ActivityTimeline';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '@mantine/core';
import AchievementsList from '@/components/Achievements/AchievementsList';
import TrustBadge from '@/components/Trust/TrustBadge';
import { useAppSelector } from '@/store';

const UserProfile: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ProfileData | null>(null);
  const [builds, setBuilds] = useState<UserBuild[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [bingoBoards, setBingoBoards] = useState<any[]>([]);
  const currentUserId = useAppSelector((state) => state.auth.userInfo.userId);

  useEffect(() => {
    if (!username) return;
    fetchData();
  }, [username]);

  const fetchData = async () => {
    try {
      const [profileData, buildsData, activityData, challengesData, bingoData] = await Promise.all([
        UserService.getProfile(username!),
        UserStatsService.getUserBuilds(username!),
        UserStatsService.getUserActivity(username!),
        UserStatsService.getUserChallenges(username!),
        UserStatsService.getUserBingoBoards(username!),
      ]);
      setData(profileData);
      setBuilds(buildsData);
      setActivities(activityData);
      setChallenges(challengesData);
      setBingoBoards(bingoData);
    } catch (error) {
      console.error('Failed to fetch profile data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay visible={true} />;
  if (!data) return <Text>User not found</Text>;

  const { profile, stats, rank, recentActivity } = data;

  return (
    <Box style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(26,27,30,1) 100%)',
          paddingTop: '4rem',
          paddingBottom: '2rem',
          marginBottom: '2rem',
          position: 'relative',
        }}
      >
        <Container size="xl">
          <Group align="flex-end" gap="xl">
            <Avatar 
              src={profile.avatar_url} 
              size={160} 
              radius={160}
              alt={profile.username}
              style={{ 
                border: '4px solid #1A1B1E',
                boxShadow: '0 0 30px rgba(0,0,0,0.5)'
              }}
            />
            <Stack gap="xs" style={{ flex: 1, paddingBottom: '1rem' }}>
              <Group>
                <Title order={1} style={{ fontSize: '3rem' }}>{profile.username}</Title>
                <TrustBadge level={profile.trust_level || 1} size="lg" />
                {rank && rank <= 10 && (
                  <Badge 
                    size="xl" 
                    variant="gradient" 
                    gradient={{ from: 'yellow', to: 'orange' }}
                    leftSection={<IconMedal size={20} />}
                  >
                    Rank #{rank}
                  </Badge>
                )}
              </Group>
              <Text size="lg" c="dimmed">{profile.email}</Text>
              <Text size="sm" c="dimmed">Member since {new Date(profile.created_at).toLocaleDateString()}</Text>
            </Stack>
          </Group>
        </Container>
      </Box>

      <Container size="xl">
        <Tabs defaultValue="overview" mb="xl">
          <Tabs.List mb="xl">
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="builds">Builds ({builds.length})</Tabs.Tab>
            <Tabs.Tab value="challenges">Challenges ({challenges.length})</Tabs.Tab>
            <Tabs.Tab value="bingo">Bingo Boards ({bingoBoards.length})</Tabs.Tab>
            <Tabs.Tab value="achievements">Achievements & Badges</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview">
            <Grid gutter="xl">
              {/* Left Column: Stats & Activity */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="xl">
                  {/* Stats Grid */}
                  <SimpleGrid cols={{ base: 2, sm: 4 }}>
                    <StatsCard
                      label="Total Points"
                      value={stats.total_points}
                      icon={IconStar}
                      color="yellow"
                      delay={0.1}
                    />
                    <StatsCard
                      label="Challenges"
                      value={stats.completed_challenges}
                      icon={IconTrophy}
                      color="blue"
                      delay={0.2}
                    />
                    <StatsCard
                      label="Builds"
                      value={stats.created_builds}
                      icon={IconSword}
                      color="red"
                      delay={0.3}
                    />
                    <StatsCard
                      label="Global Rank"
                      value={rank ? `#${rank}` : '-'}
                      icon={IconMedal}
                      color="green"
                      delay={0.4}
                    />
                  </SimpleGrid>

                  {/* Created Builds Showcase */}
                  <Box>
                    <Group justify="space-between" mb="md">
                      <Title order={3}>Created Builds</Title>
                      {builds.length > 0 && (
                        <Button variant="subtle" rightSection={<IconArrowRight size={16} />} onClick={() => navigate('/builds')}>
                          View All
                        </Button>
                      )}
                    </Group>
                    {builds.length > 0 ? (
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        {builds.slice(0, 4).map((build) => (
                          <Paper
                            key={build.id}
                            p="md"
                            radius="md"
                            withBorder
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => navigate(`/builds/${build.id}`)}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                          >
                            <Group mb="sm">
                              {build.game_icon && (
                                <Avatar src={build.game_icon} size="sm" radius="xl" />
                              )}
                              <Text fw={600} lineClamp={1}>{build.build_name}</Text>
                            </Group>
                            <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                              {build.description}
                            </Text>
                            <Badge size="sm" variant="light">
                              {build.game_name}
                            </Badge>
                          </Paper>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Paper p="xl" withBorder radius="md" ta="center" bg="dark.8">
                        <Text c="dimmed">No builds created yet.</Text>
                      </Paper>
                    )}
                  </Box>
                </Stack>
              </Grid.Col>

              {/* Right Column: Activity Timeline */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper p="xl" radius="md" withBorder>
                  <Title order={3} mb="xl">Recent Completions</Title>
                  <ActivityTimeline activities={activities} />
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="builds">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {builds.map((build) => (
                <Paper
                  key={build.id}
                  p="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
                  onClick={() => navigate(`/builds/${build.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {String(profile.id) === String(currentUserId) && (
                    <ActionIcon 
                      variant="filled" 
                      color="blue" 
                      style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/builds/edit/${build.id}`);
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  <Group mb="md" justify="space-between">
                    <Group>
                        {build.game_icon && (
                            <Avatar src={build.game_icon} size="sm" radius="xl" />
                        )}
                        <Badge size="sm" variant="light">{build.game_name}</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{new Date(build.created_at).toLocaleDateString()}</Text>
                  </Group>
                  <Text fw={700} size="lg" mb="xs" lineClamp={1}>{build.build_name}</Text>
                  <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                    {build.description}
                  </Text>
                </Paper>
              ))}
              {builds.length === 0 && (
                <Text c="dimmed" ta="center" style={{ gridColumn: '1 / -1' }}>No builds found.</Text>
              )}
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="challenges">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {challenges.map((challenge) => (
                <Paper
                  key={challenge.id}
                  p="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {String(profile.id) === String(currentUserId) && (
                    <ActionIcon 
                      variant="filled" 
                      color="blue" 
                      style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/challenges/edit/${challenge.id}`);
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  <Group mb="md" justify="space-between">
                    <Group>
                        {challenge.game_icon && (
                            <Avatar src={challenge.game_icon} size="sm" radius="xl" />
                        )}
                        <Badge size="sm" variant="light">{challenge.game_name}</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{new Date(challenge.created_at).toLocaleDateString()}</Text>
                  </Group>
                  <Text fw={700} size="lg" mb="xs" lineClamp={1}>{challenge.challenge_name}</Text>
                  <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                    {challenge.description}
                  </Text>
                  <Badge color={challenge.type === 'permanent' ? 'blue' : 'green'} variant="dot" mt="sm">
                    {challenge.type}
                  </Badge>
                </Paper>
              ))}
              {challenges.length === 0 && (
                <Text c="dimmed" ta="center" style={{ gridColumn: '1 / -1' }}>No challenges found.</Text>
              )}
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="bingo">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {bingoBoards.map((board) => (
                <Paper
                  key={board.id}
                  p="lg"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
                  onClick={() => navigate(`/bingo/${board.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {String(profile.id) === String(currentUserId) && (
                    <ActionIcon 
                      variant="filled" 
                      color="blue" 
                      style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/bingo/edit/${board.id}`);
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  )}
                  <Group mb="md" justify="space-between">
                    <Group>
                        {board.game_icon && (
                            <Avatar src={board.game_icon} size="sm" radius="xl" />
                        )}
                        <Badge size="sm" variant="light">{board.game_name}</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">{new Date(board.created_at).toLocaleDateString()}</Text>
                  </Group>
                  <Text fw={700} size="lg" mb="xs" lineClamp={1}>{board.title}</Text>
                  <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                    {board.description}
                  </Text>
                  <Group mt="sm">
                    <Badge variant="outline">{board.size}x{board.size}</Badge>
                    <Badge variant="outline">{board.type}</Badge>
                  </Group>
                </Paper>
              ))}
              {bingoBoards.length === 0 && (
                <Text c="dimmed" ta="center" style={{ gridColumn: '1 / -1' }}>No bingo boards found.</Text>
              )}
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="achievements">
            <AchievementsList />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
};

export default UserProfile;
