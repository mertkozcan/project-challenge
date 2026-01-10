import React, { useEffect, useState } from 'react';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay, Paper, Table } from '@mantine/core';
import { IconTrophy, IconUsers, IconClock, IconCalendar, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BingoHistoryService } from '@/services/bingo/bingoHistory.service';
import { useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';

const BingoGameDetails: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  
  const [gameDetails, setGameDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameDetails();
  }, [roomId]);

  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      if (!roomId || !userId) return;
      const data = await BingoHistoryService.getGameDetails(roomId, userId);
      console.log('Game details received:', data);
      setGameDetails(data);
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string, i18nField?: string) => {
    return new Date(dateString).toLocaleDateString(i18nField || 'en-US', {
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

  if (!gameDetails) {
    return (
      <Container size="xl" py="xl">
        <Text>{t('history.gameNotFound')}</Text>
        <Button onClick={() => navigate('/bingo/history')}>{t('bingo.backToHistory')}</Button>
      </Container>
    );
  }

  if (!gameDetails.cells || gameDetails.cells.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Text>{t('history.noData')}</Text>
        <Button onClick={() => navigate('/bingo/history')}>{t('bingo.backToHistory')}</Button>
      </Container>
    );
  }

  const gridSize = gameDetails.board_size || 5;
  const rows: any[][] = [];
  
  for (let i = 0; i < gridSize; i++) {
    rows.push(gameDetails.cells.filter((cell: any) => cell.row_index === i));
  }

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{gameDetails.board_title}</Title>
          <Text c="dimmed">{gameDetails.game_name}</Text>
        </div>
        <Button 
          leftSection={<IconArrowLeft size={16} />}
          variant="light"
          onClick={() => navigate('/bingo/history')}
        >
          {t('bingo.backToHistory')}
        </Button>
      </Group>

      <Grid>
        {/* Game Info */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {/* Winner Card */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={700}>{t('history.winner')}</Text>
                  <IconTrophy size={24} color="#FFD700" />
                </Group>
                <Group gap="sm">
                  <Avatar src={gameDetails.winner_avatar} size="lg" />
                  <div>
                    <Text fw={600} size="lg">{gameDetails.winner_username}</Text>
                    <Text size="sm" c="dimmed">
                      {gameDetails.win_type === 'row' 
                        ? t('history.row', { index: gameDetails.win_index + 1 }) 
                        : t('history.column', { index: gameDetails.win_index + 1 })}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Card>

            {/* Game Stats */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={700}>{t('history.statistics')}</Text>
                
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconUsers size={16} />
                    <Text size="sm">{t('bingo.players')}</Text>
                  </Group>
                  <Text size="sm" fw={600}>{gameDetails.participants?.length || 0}</Text>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconClock size={16} />
                    <Text size="sm">{t('common.duration')}</Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    {formatDuration((new Date(gameDetails.completed_at).getTime() - new Date(gameDetails.started_at).getTime()) / 1000)}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <IconCalendar size={16} />
                    <Text size="sm">{t('dashboard.completed')}</Text>
                  </Group>
                  <Text size="sm" fw={600}>{formatDate(gameDetails.completed_at)}</Text>
                </Group>
              </Stack>
            </Card>

            {/* Participants */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={700}>{t('bingo.players')}</Text>
                {gameDetails.participants?.map((participant: any) => (
                  <Paper key={participant.user_id} p="sm" withBorder>
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Avatar src={participant.avatar_url} size="sm" />
                        <Text size="sm">{participant.username}</Text>
                      </Group>
                      {participant.user_id === gameDetails.winner_user_id && (
                        <IconTrophy size={16} color="#FFD700" />
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>

        {/* Bingo Board */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="md" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">{t('history.finalBoardState')}</Title>
            <Stack gap="xs">
              {rows.map((row, rowIndex) => (
                <Group key={rowIndex} gap="xs" grow>
                  {row.map((cell: any) => {
                    const isWinningCell = 
                      (gameDetails.win_type === 'row' && cell.row_index === gameDetails.win_index) ||
                      (gameDetails.win_type === 'column' && cell.col_index === gameDetails.win_index);
                    
                    return (
                      <Paper
                        key={cell.cell_id}
                        p="md"
                        withBorder
                        style={{
                          backgroundColor: cell.completed_by_user_id 
                            ? isWinningCell 
                              ? 'rgba(255, 215, 0, 0.2)' 
                              : 'rgba(64, 192, 87, 0.2)' 
                            : 'transparent',
                          borderColor: isWinningCell ? '#FFD700' : cell.completed_by_user_id ? '#40c057' : undefined,
                          borderWidth: cell.completed_by_user_id ? 2 : 1,
                          minHeight: '100px',
                        }}
                      >
                        <Stack gap="xs" align="center" justify="center" style={{ minHeight: '80px' }}>
                          <Text size="sm" ta="center" lineClamp={3}>
                            {cell.task}
                          </Text>
                          
                          {cell.completed_by_user_id && (
                            <Group gap="xs">
                              <Avatar size="xs" src={cell.completed_by_avatar} />
                              <Text size="xs" fw={500}>
                                {cell.completed_by_username}
                              </Text>
                              <IconCheck size={14} color="#40c057" />
                            </Group>
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default BingoGameDetails;
