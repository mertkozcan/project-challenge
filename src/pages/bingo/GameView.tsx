import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay, Modal, Paper } from '@mantine/core';
import { IconTrophy, IconCheck, IconDoorExit } from '@tabler/icons-react';
import { BingoRoomService, BingoCellState } from '@/services/bingo/bingoRoom.service';
import { useAppSelector } from '@/store';
import SocketService from '@/services/socket.service';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameSounds } from '@/hooks/useGameSounds';
import BingoHero from '@/components/Bingo/BingoHero';

const BingoGameView: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const { playSound } = useGameSounds();

  const [room, setRoom] = useState<any>(null);
  const [boardState, setBoardState] = useState<BingoCellState[]>([]);
  const [loading, setLoading] = useState(true);
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    // Connect to WebSocket
    const socket = SocketService.connect();
    SocketService.joinRoom(roomId, userId);

    // Initial data fetch
    fetchGameData();

    // Listen for real-time events
    SocketService.on('cell-completed', handleCellCompleted);
    SocketService.on('game-ended', handleGameEnded);
    SocketService.on('player-joined', handlePlayerJoined);
    SocketService.on('player-left', handlePlayerLeft);

    return () => {
      // Cleanup
      SocketService.leaveRoom(roomId, userId);
      SocketService.off('cell-completed', handleCellCompleted);
      SocketService.off('game-ended', handleGameEnded);
      SocketService.off('player-joined', handlePlayerJoined);
      SocketService.off('player-left', handlePlayerLeft);
    };
  }, [roomId, userId]);

  const fetchGameData = async () => {
    if (!roomId) return;
    
    try {
      const [roomData, cells] = await Promise.all([
        BingoRoomService.getRoomDetails(roomId),
        BingoRoomService.getBoardState(roomId),
      ]);
      
      setRoom(roomData);
      setBoardState(cells);
      
      // Check if game already ended
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

  const handleCellCompleted = async (data: { cellId: number; userId: string }) => {
    playSound('complete');
    // Refresh board state to show the completed cell
    if (!roomId) return;
    try {
      const cells = await BingoRoomService.getBoardState(roomId);
      setBoardState(cells);
    } catch (error) {
      console.error('Error refreshing board state:', error);
    }
  };

  const handleGameEnded = (data: { winnerId: string; winType: string; winIndex: number; statistics: any }) => {
    const isMe = data.winnerId === userId;
    const winnerName = isMe ? 'You' : room?.participants?.find((p: any) => p.user_id === data.winnerId)?.username || 'Someone';
    
    setWinner(winnerName);
    setStatistics(data.statistics);
    setWinModalOpen(true);

    if (isMe) {
      playSound('win');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handlePlayerJoined = async () => {
    playSound('join');
    // Refresh room data to show new player
    await fetchGameData();
  };

  const handlePlayerLeft = async () => {
    // Refresh room data to remove player
    await fetchGameData();
  };

  const handleCellClick = async (cellId: number) => {
    playSound('click');
    if (!roomId || !userId) return;
    
    // Optimistic update
    setBoardState(prev => prev.map(cell => {
      if (cell.cell_id === cellId) {
        return {
          ...cell,
          completed_by_user_id: userId,
          completed_by_username: 'You',
          completed_by_avatar: undefined
        };
      }
      return cell;
    }));

    try {
      const response = await BingoRoomService.completeCell(roomId, cellId, userId);
      
      if (response.gameWon) {
        handleGameEnded({
          winnerId: userId,
          winType: response.winType || 'row',
          winIndex: response.winIndex || 0,
          statistics: null
        });
      }
    } catch (error) {
      console.error('Error completing cell:', error);
      fetchGameData(); // Revert on error
    }
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
      <Group justify="space-between" mb="xl">
        <BingoHero 
          title={room?.board_title || 'Bingo Game'}
          gameName={room?.game_name || 'Multiplayer'}
          description={`Host: ${room?.host_username || 'Unknown'} • Players: ${room?.player_count || 0}/${room?.max_players || 0}`}
          size={gridSize}
        />
        <Button 
          color="red" 
          variant="light" 
          leftSection={<IconDoorExit size={16} />}
          onClick={() => navigate('/multiplayer/rooms')}
        >
          Leave Game
        </Button>
      </Group>

      <Container size="xl" mt="xl">
        <Grid>
          {/* Main Bingo Board */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Paper
              p={{ base: 'xs', md: 'xl' }}
              radius="md"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Stack gap={8}>
                {rows.map((row, rowIndex) => (
                  <Group key={rowIndex} gap={8} grow wrap="nowrap">
                    {row.map((cell) => {
                      const isCompleted = !!cell.completed_by_user_id;
                      const isMyCompletion = cell.completed_by_user_id === userId;
                      
                      return (
                        <motion.div
                          key={cell.cell_id}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ flex: '1 1 0', minWidth: 0 }}
                        >
                          <Paper
                            p="xs"
                            withBorder
                            onClick={() => !isCompleted && handleCellClick(cell.cell_id)}
                            style={{
                              height: 'auto',
                              aspectRatio: '1/1',
                              minHeight: '60px',
                              maxHeight: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: isCompleted ? 'default' : 'pointer',
                              backgroundColor: isCompleted 
                                ? isMyCompletion ? 'rgba(64, 192, 87, 0.15)' : 'rgba(34, 139, 230, 0.15)'
                                : 'var(--mantine-color-body)',
                              borderColor: isCompleted 
                                ? isMyCompletion ? '#40c057' : '#228be6'
                                : undefined,
                              borderWidth: isCompleted ? 2 : 1,
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              width: '100%'
                            }}
                          >
                            <Text 
                              size="sm" 
                              ta="center" 
                              fw={500}
                              style={{ 
                                zIndex: 1,
                                userSelect: 'none',
                                fontSize: 'clamp(0.6rem, 2vw, 0.9rem)',
                                lineHeight: 1.2
                              }}
                            >
                              {cell.task}
                            </Text>
                            
                            <AnimatePresence>
                              {isCompleted && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                  style={{
                                    position: 'absolute',
                                    bottom: 4,
                                    right: 4,
                                  }}
                                >
                                  <IconCheck size={16} color={isMyCompletion ? "#40c057" : "#228be6"} stroke={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Show who completed it if not me */}
                            {isCompleted && !isMyCompletion && (
                              <Text 
                                size="xs" 
                                c="blue" 
                                style={{ 
                                  position: 'absolute', 
                                  top: 2, 
                                  fontSize: '0.6rem',
                                  opacity: 0.8
                                }}
                              >
                                {cell.completed_by_username}
                              </Text>
                            )}
                          </Paper>
                        </motion.div>
                      );
                    })}
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Sidebar - Game Info & Chat (Placeholder) */}
          <Grid.Col span={{ base: 12, md: 3 }}>
             <Paper p="md" radius="md" withBorder>
                <Title order={3} mb="md">Game Info</Title>
                <Stack>
                   <Group justify="space-between">
                      <Text>Status:</Text>
                      <Badge color={room?.status === 'IN_PROGRESS' ? 'green' : 'yellow'}>
                        {room?.status}
                      </Badge>
                   </Group>
                   <Text size="sm" c="dimmed">
                      First to complete a row, column, or diagonal wins!
                   </Text>
                </Stack>
             </Paper>

             <Paper p="md" radius="md" withBorder mt="md">
                <Title order={3} mb="md">Players</Title>
                <Stack gap="sm">
                  {room?.participants?.map((participant: any) => (
                    <motion.div
                      key={participant.user_id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                    >
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Avatar src={participant.avatar_url} radius="xl" />
                          <Text fw={500}>{participant.username}</Text>
                        </Group>
                        {participant.user_id === room?.host_user_id && (
                          <Badge color="yellow">Host</Badge>
                        )}
                      </Group>
                    </motion.div>
                  ))}
                </Stack>
             </Paper>
          </Grid.Col>
        </Grid>
      </Container>

      <Modal 
        opened={winModalOpen} 
        onClose={() => setWinModalOpen(false)}
        title={<Group><IconTrophy color="#FFD700" size={24} /><Text fw={700} size="lg">BINGO!</Text></Group>}
        centered
        size="lg"
      >
        <Stack align="center" py="xl">
          <motion.div
            initial={{ scale: 0, rotate: 360 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1 }}
          >
            <IconTrophy size={80} color="#FFD700" />
          </motion.div>
          
          <Title order={2} ta="center">
            {winner} Won the Game!
          </Title>
          
          {statistics && (
            <Card withBorder w="100%" mt="md">
              <Stack gap="xs">
                <Text fw={700}>Game Stats:</Text>
                <Group justify="space-between">
                  <Text>Total Players:</Text>
                  <Text fw={600}>{statistics.participants?.length}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>Duration:</Text>
                  <Text fw={600}>{Math.floor(statistics.room?.duration_seconds / 60)}m {Math.floor(statistics.room?.duration_seconds % 60)}s</Text>
                </Group>
              </Stack>
            </Card>
          )}

          <Group mt="xl">
            <Button onClick={() => navigate('/bingo/rooms')}>Back to Lobby</Button>
            <Button variant="light" onClick={() => navigate(`/bingo/history/${roomId}`)}>View Details</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default BingoGameView;
