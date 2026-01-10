import React, { useEffect, useState } from 'react';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay } from '@mantine/core';
import { IconTrophy, IconUsers, IconClock, IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { BingoHistoryService, GameHistory } from '@/services/bingo/bingoHistory.service';
import { useAppSelector } from '@/store';

import { useTranslation } from 'react-i18next';

const BingoHistory: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const { t, i18n } = useTranslation();
  
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect guests to login
  useEffect(() => {
    if (!userId) {
      navigate('/sign-in', { state: { message: t('bingo.loginRequiredForHistory') } });
    }
  }, [userId, navigate, t]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      if (!userId) return;
      const data = await BingoHistoryService.getMyGameHistory(userId);
      setGames(data);
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return t('common.durationMinutesSeconds', { mins, secs });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{t('bingo.gameHistory')}</Title>
          <Text c="dimmed">{t('bingo.gameHistorySubtitle')}</Text>
        </div>
        <Button onClick={() => navigate('/bingo/rooms')}>
          {t('bingo.backToLobby')}
        </Button>
      </Group>

      {games.length === 0 ? (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconTrophy size={48} color="gray" />
            <Text size="lg" c="dimmed">{t('bingo.noGamesYet')}</Text>
            <Text size="sm" c="dimmed">{t('bingo.playToSeeHistory')}</Text>
            <Button onClick={() => navigate('/bingo/rooms')}>{t('bingo.findAGame')}</Button>
          </Stack>
        </Card>
      ) : (
        <Grid>
          {games.map((game) => (
            <Grid.Col key={game.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Text fw={700} size="lg">{game.board_title}</Text>
                    <Badge color="green">{t('dashboard.completed')}</Badge>
                  </Group>

                  <Group gap="xs">
                    <IconTrophy size={16} />
                    <Text size="sm" c="dimmed">{game.game_name}</Text>
                  </Group>

                  {/* Winner */}
                  <Group gap="sm">
                    <Avatar src={game.winner_avatar} size="sm" />
                    <div>
                      <Text size="xs" c="dimmed">{t('bingo.winner')}</Text>
                      <Text size="sm" fw={500}>{game.winner_username}</Text>
                    </div>
                  </Group>

                  {/* Stats */}
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconUsers size={16} />
                      <Text size="sm">{t('bingo.playersCount', { count: game.participant_count })}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconClock size={16} />
                      <Text size="sm">{formatDuration(game.duration_seconds)}</Text>
                    </Group>
                  </Group>

                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="xs" c="dimmed">{formatDate(game.completed_at)}</Text>
                  </Group>

                  <Button 
                    fullWidth 
                    variant="light"
                    onClick={() => navigate(`/bingo/history/${game.id}`)}
                  >
                    {t('bingo.viewDetails')}
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BingoHistory;
