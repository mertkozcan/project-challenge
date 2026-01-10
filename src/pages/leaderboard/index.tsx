import React, { useEffect, useState } from 'react';
import { 
  Container, Title, Table, Avatar, Group, Text, Tabs, 
  LoadingOverlay, Paper, Box, Stack, Badge, Card, Center,
  ThemeIcon, rem
} from '@mantine/core';
import { LeaderboardService, GlobalLeaderboardEntry } from '@/services/leaderboard/leaderboard.service';
import { BingoLeaderboardService } from '@/services/bingo/bingoLeaderboard.service';
import { IconTrophy, IconMedal, IconStar, IconCrown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const PodiumItem = ({ entry, rank, type }: { entry: GlobalLeaderboardEntry; rank: number; type: 'completions' | 'points' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  const color = isFirst ? '#FFD700' : isSecond ? '#C0C0C0' : '#CD7F32';
  const height = isFirst ? 280 : 240;
  const avatarSize = isFirst ? 100 : 80;

  return (
    <Card 
      padding="xl" 
      radius="md" 
      withBorder 
      style={{ 
        height, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderColor: color,
        borderWidth: 2,
        position: 'relative',
        background: 'rgba(26, 27, 30, 0.5)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        overflow: 'visible',
      }}
      onClick={() => navigate(`/profile/${entry.username}`)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ position: 'absolute', top: -20 }}>
        <ThemeIcon 
          size={40} 
          radius="xl" 
          color={isFirst ? 'yellow' : isSecond ? 'gray' : 'orange'}
          variant="filled"
        >
          {isFirst ? <IconCrown size={24} /> : <IconMedal size={24} />}
        </ThemeIcon>
      </div>
      
      <Avatar 
        src={entry.avatar_url} 
        size={avatarSize} 
        radius={avatarSize} 
        style={{ border: `4px solid ${color}`, marginBottom: '1rem' }} 
      />
      
      <Text fw={700} size="lg" lineClamp={1}>{entry.username}</Text>
      
      <Badge 
        size="lg" 
        variant="gradient" 
        gradient={{ from: color, to: color, deg: 45 }}
        style={{ marginTop: '0.5rem' }}
      >
        {type === 'completions' 
          ? t('leaderboard.challengesSuffix', { count: entry.completed_count }) 
          : t('leaderboard.pointsSuffix', { count: entry.points })}
      </Badge>
      
      <Text size="sm" c="dimmed" mt="xs">{t('leaderboard.rankSuffix', { rank })}</Text>
    </Card>
  );
};

const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState<GlobalLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('completions');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        let data;
        if (activeTab?.startsWith('bingo-')) {
          // Fetch bingo leaderboard
          const bingoType = activeTab.replace('bingo-', '') as 'wins' | 'fastest' | 'games' | 'streaks';
          const bingoData = await BingoLeaderboardService.getLeaderboard(bingoType);
          // Transform to match GlobalLeaderboardEntry format
          data = bingoData.map(entry => ({
            ...entry,
            completed_count: entry.value,
            points: entry.value
          }));
        } else {
          // Fetch regular leaderboard
          data = await LeaderboardService.getGlobalRankings(activeTab as 'completions' | 'points');
        }
        setRankings(data);
      } catch (error) {
        console.error('Failed to fetch rankings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [activeTab]);

  const topThree = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  // Reorder top 3 for visual podium: 2nd, 1st, 3rd
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push({ ...topThree[1], rank: 2 });
  if (topThree[0]) podiumOrder.push({ ...topThree[0], rank: 1 });
  if (topThree[2]) podiumOrder.push({ ...topThree[2], rank: 3 });

  return (
    <Container size="lg" py="xl">
      <Stack align="center" mb={50}>
        <Title order={1} style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1px' }}>
          {t('leaderboard.title')}
        </Title>
        <Text c="dimmed" size="lg">{t('leaderboard.subtitle')}</Text>
      </Stack>

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab} 
        variant="pills" 
        radius="xl" 
        mb="xl"
        styles={{
            list: { justifyContent: 'center' }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="completions" leftSection={<IconTrophy size={18} />}>
            {t('leaderboard.mostCompleted')}
          </Tabs.Tab>
          <Tabs.Tab value="points" leftSection={<IconStar size={18} />}>
            {t('leaderboard.topPoints')}
          </Tabs.Tab>
          <Tabs.Tab value="bingo-wins" leftSection={<IconTrophy size={18} />}>
            {t('leaderboard.bingoWins')}
          </Tabs.Tab>
          <Tabs.Tab value="bingo-fastest" leftSection={<IconStar size={18} />}>
            {t('leaderboard.speedDemons')}
          </Tabs.Tab>
          <Tabs.Tab value="bingo-games" leftSection={<IconTrophy size={18} />}>
            {t('leaderboard.bingoMasters')}
          </Tabs.Tab>
          <Tabs.Tab value="bingo-streaks" leftSection={<IconStar size={18} />}>
            {t('leaderboard.winStreaks')}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Box style={{ position: 'relative', minHeight: 400 }}>
        <LoadingOverlay visible={loading} overlayProps={{ radius: 'sm', blur: 2 }} />
        
        {!loading && (
          <>
            {/* Podium Section */}
            {podiumOrder.length > 0 && (
              <Box mb={50}>
                <Group justify="center" align="flex-end" gap="md">
                    {podiumOrder.map((entry) => (
                        <Box key={entry.username} w={{ base: '100%', sm: 250 }}>
                            <PodiumItem 
                                entry={entry} 
                                rank={entry.rank} 
                                type={activeTab as 'completions' | 'points'} 
                            />
                        </Box>
                    ))}
                </Group>
              </Box>
            )}

            {/* List Section */}
            {rest.length > 0 && (
              <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                  <Table verticalSpacing="md" highlightOnHover miw={500}>
                    <Table.Thead bg="dark.8">
                      <Table.Tr>
                        <Table.Th w={80} ta="center">{t('leaderboard.rank')}</Table.Th>
                        <Table.Th>{t('leaderboard.player')}</Table.Th>
                        <Table.Th ta="right">
                          {activeTab === 'completions' ? t('leaderboard.challenges') : t('leaderboard.points')}
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {rest.map((entry, index) => (
                        <Table.Tr 
                          key={entry.username} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/profile/${entry.username}`)}
                        >
                          <Table.Td ta="center">
                            <Badge variant="light" color="gray" circle size="lg">
                              {index + 4}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar src={entry.avatar_url} radius="xl" size={40} />
                              <Text fw={600}>{entry.username}</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text fw={700} c={activeTab === 'points' ? 'yellow' : 'blue'}>
                              {activeTab === 'completions' ? entry.completed_count : entry.points}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Box>
              </Paper>
            )}
            
            {rankings.length === 0 && (
                <Center p="xl">
                    <Text c="dimmed">{t('leaderboard.noRankings')}</Text>
                </Center>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Leaderboard;
