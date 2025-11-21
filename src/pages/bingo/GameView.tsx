import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay, Modal, Paper } from '@mantine/core';
import { IconTrophy, IconCheck, IconDoorExit } from '@tabler/icons-react';
import { BingoRoomService, BingoCellState } from '@/services/bingo/bingoRoom.service';
import { useAppSelector } from '@/store';

const BingoGameView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const userId = useAppSelector((state) => state.auth.userInfo.userId);

  const [room, setRoom] = useState<any>(null);
  const [boardState, setBoardState] = useState<BingoCellState[]>([]);
  const [loading, setLoading] = useState(true);
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;
    fetchGameData();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchGameData, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  const fetchGameData = async () => {
    if (!roomId) return;
    
    try {
      const [roomData, cells] = await Promise.all([
        BingoRoomService.getRoomDetails(roomId),
        BingoRoomService.getBoardState(roomId),
      ]);
      
      setRoom(roomData);
      setBoardState(cells);
      
      // Check if game ended
      if (roomData.status === 'COMPLETED' && roomData.winner_username) {
        setWinner(roomData.winner_username);
        setWinModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCell = async (cellId: number) => {
    if (!roomId) return;
    
    try {
      if (!userId) return;
      const result = await BingoRoomService.completeCell(roomId, cellId, userId);
      
      if (result.gameWon) {
        setWinner('You');
        setWinModalOpen(true);
      }
      
      // Refresh board state
      await fetchGameData();
    } catch (error) {
      console.error('Error completing cell:', error);
    }
  };

  const handleLeaveGame = () => {
    // Navigate back to bingo board if boardId exists, otherwise to rooms
    navigate(boardId ? `/bingo/${boardId}` : '/bingo/rooms');
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  const gridSize = room?.board_size || 5;
  const rows: BingoCellState[][] = [];
  
  for (let i = 0; i < gridSize; i++) {
    rows.push(boardState.filter(cell => cell.row_index === i));
  }

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{room?.board_title}</Title>
          <Text c="dimmed">{room?.game_name}</Text>
        </div>
        <Group>
          <Badge size="lg" color="blue">In Progress</Badge>
          <Button 
            variant="light" 
            color="red" 
            leftSection={<IconDoorExit size={16} />}
            onClick={handleLeaveGame}
          >
            Leave
          </Button>
        </Group>
      </Group>

      <Grid>
        {/* Bingo Board */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="md" padding="lg" radius="md" withBorder>
            <Stack gap="xs">
              {rows.map((row, rowIndex) => (
                <Group key={rowIndex} gap="xs" grow>
                  {row.map((cell) => {
                    const isCompletedByMe = cell.completed_by_user_id === userId;
                    const isCompletedByOther = cell.completed_by_user_id && !isCompletedByMe;
                    
                    return (
                      <Paper
                        key={cell.cell_id}
                        p="md"
                        withBorder
                        style={{
                          cursor: cell.completed_by_user_id ? 'default' : 'pointer',
                          backgroundColor: isCompletedByMe 
                            ? 'rgba(64, 192, 87, 0.2)' 
                            : isCompletedByOther 
                            ? 'rgba(128, 128, 128, 0.2)' 
                            : 'transparent',
                          borderColor: isCompletedByMe ? '#40c057' : isCompletedByOther ? '#868e96' : undefined,
                          borderWidth: cell.completed_by_user_id ? 2 : 1,
                          position: 'relative',
                          minHeight: '100px',
                        }}
                        onClick={() => !cell.completed_by_user_id && handleCompleteCell(cell.cell_id)}
                      >
                        <Stack gap="xs" align="center" justify="center" style={{ minHeight: '80px' }}>
                          <Text size="sm" ta="center" lineClamp={3}>
                            {cell.task}
                          </Text>
                          
                          {cell.completed_by_user_id && (
                            <Group gap="xs">
                              <Avatar size="xs" src={cell.completed_by_avatar} />
                              <Text size="xs" fw={500}>
                                {isCompletedByMe ? 'You' : cell.completed_by_username}
                              </Text>
                              <IconCheck size={14} color={isCompletedByMe ? '#40c057' : '#868e96'} />
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

        {/* Leaderboard / Stats */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              <Group gap="xs">
                <IconTrophy size={24} />
                Players
              </Group>
            </Title>

            <Stack gap="md">
              {room?.participants?.map((participant: any) => {
                const completedCount = boardState.filter(
                  cell => cell.completed_by_user_id === participant.user_id
                ).length;

                return (
                  <Paper key={participant.id} p="sm" withBorder>
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Avatar src={participant.avatar_url} size="sm" />
                        <Text size="sm" fw={500}>
                          {participant.username}
                          {participant.user_id === userId && ' (You)'}
                        </Text>
                      </Group>
                      <Badge color="blue">{completedCount}</Badge>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
            <Text size="sm" c="dimmed" ta="center">
              Complete a full row or column to win!
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Win Modal */}
      <Modal
        opened={winModalOpen}
        onClose={() => setWinModalOpen(false)}
        title={winner === 'You' ? '🎉 Congratulations!' : 'Game Over'}
        centered
        size="md"
      >
        <Stack align="center" gap="md" py="xl">
          <IconTrophy size={64} color="#FFD700" />
          <Title order={2}>
            {winner === 'You' ? 'You Won!' : `${winner} Won!`}
          </Title>
          <Text size="lg" c="dimmed" ta="center">
            {winner === 'You' 
              ? 'You completed a full row or column first!' 
              : `${winner} completed a full row or column first!`}
          </Text>
          <Group>
            <Button onClick={() => navigate('/bingo/rooms')}>
              Back to Lobby
            </Button>
            <Button variant="light" onClick={() => setWinModalOpen(false)}>
              View Board
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default BingoGameView;
