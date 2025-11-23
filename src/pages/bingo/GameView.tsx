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
import BingoCell from '@/components/Bingo/BingoCell';
import ChatBox from '@/components/Chat/ChatBox';

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
          is_completed_by_me: true,
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

  // Theme Styles
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'ELDEN_RING':
        return {
          bg: '#1a1a1a',
          boardBg: 'linear-gradient(145deg, #2c2c2c, #1a1a1a)',
          borderColor: '#cfb53b',
          textColor: '#f0e6d2',
          accentColor: '#cfb53b',
          fontFamily: 'serif',
        };
      case 'CYBERPUNK':
        return {
          bg: '#050510',
          boardBg: 'linear-gradient(145deg, #0a0a20, #050510)',
          borderColor: '#00ffea',
          textColor: '#ffffff',
          accentColor: '#ff00ff',
          fontFamily: 'monospace',
        };
      case 'HALLOWEEN':
        return {
          bg: '#1a0520',
          boardBg: 'linear-gradient(145deg, #2d0a35, #1a0520)',
          borderColor: '#ff6b00',
          textColor: '#ffe0b2',
          accentColor: '#ff6b00',
          fontFamily: 'cursive',
        };
      case 'CHRISTMAS':
        return {
          bg: '#0b2e13',
          boardBg: 'linear-gradient(145deg, #155724, #0b2e13)',
          borderColor: '#d4af37',
          textColor: '#ffffff',
          accentColor: '#c82333',
          fontFamily: 'sans-serif',
        };
      default:
        return {
          bg: undefined,
          boardBg: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          textColor: undefined,
          accentColor: undefined,
          fontFamily: undefined,
        };
    }
  };

  const themeStyles = getThemeStyles(room?.theme || 'DEFAULT');

  return (
    <Container size="xl" py="xl" style={{ fontFamily: themeStyles.fontFamily }}>
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
                background: themeStyles.boardBg,
                border: `1px solid ${themeStyles.borderColor}`,
              }}
            >
              <Stack gap={8}>
                {rows.map((row, rowIndex) => (
                  <Group key={rowIndex} gap={8} grow wrap="nowrap">
                    {row.map((cell) => {
                      // Logic:
                      // If I completed it -> Green/Theme Color
                      // If someone else completed it:
                      //    - Standard: I can still complete it (don't show as taken unless I want to see history)
                      //    - Lockout: It is LOCKED (Red/Gray)
                      
                      const isMyCompletion = cell.is_completed_by_me;
                      const isLocked = room?.game_mode === 'LOCKOUT' && !!cell.completed_by_user_id && !isMyCompletion;
                      
                      return (
                        <BingoCell
                          key={cell.cell_id}
                          task={cell.task}
                          isCompleted={isMyCompletion || isLocked}
                          completedBy={isLocked ? cell.completed_by_username : undefined}
                          isMyCompletion={isMyCompletion}
                          onClick={() => !isMyCompletion && !isLocked && handleCellClick(cell.cell_id)}
                          disabled={!!winModalOpen || isLocked}
                          style={isLocked ? { opacity: 0.5, filter: 'grayscale(1)' } : { borderColor: isMyCompletion ? themeStyles.accentColor : undefined }}
                        />
                      );
                    })}
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Sidebar - Game Info & Chat */}
          <Grid.Col span={{ base: 12, md: 3 }}>
             <Stack gap="md" h="100%">
                <Paper p="md" radius="md" withBorder>
                   <Title order={3} mb="md">Game Info</Title>
                   <Stack>
                      <Group justify="space-between">
                         <Text>Status:</Text>
                         <Badge color={room?.status === 'IN_PROGRESS' ? 'green' : 'yellow'}>
                           {room?.status}
                         </Badge>
                      </Group>
                      <Group justify="space-between">
                         <Text>Mode:</Text>
                         <Badge variant="outline" color="blue">{room?.game_mode}</Badge>
                      </Group>
                      <Group justify="space-between">
                         <Text>Theme:</Text>
                         <Badge variant="outline" color="pink">{room?.theme}</Badge>
                      </Group>
                      
                      <Text size="sm" c="dimmed" mt="sm">
                        {room?.game_mode === 'BLACKOUT' 
                          ? 'Cover ALL cells to win!' 
                          : room?.game_mode === 'LOCKOUT'
                          ? 'Race to claim cells! Once taken, they are locked.'
                          : 'First to complete a row, column, or diagonal wins!'}
                      </Text>
                   </Stack>
                </Paper>

                <Paper p="md" radius="md" withBorder style={{ flex: 1, minHeight: '400px' }}>
                   <ChatBox roomId={roomId || ''} />
                </Paper>

                <Paper p="md" radius="md" withBorder>
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
             </Stack>
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
