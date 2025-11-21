import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Button,
  LoadingOverlay,
  Badge,
  Group,
  Box,
  Stack,
  NumberInput,
  Modal,
  Switch,
  PasswordInput,
  Card,
} from '@mantine/core';
import { BingoService, type BingoCell, type BingoBoard as BingoBoardType } from '@/services/bingo/bingo.service';
import { BingoRoomService } from '@/services/bingo/bingoRoom.service';
import { IconCheck, IconClock, IconArrowLeft, IconTrophy, IconUsers } from '@tabler/icons-react';
import { useAppSelector } from '@/store';
import BingoHero from '@/components/Bingo/BingoHero';
import { getGameTheme } from '@/utils/gameThemes';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameSounds } from '@/hooks/useGameSounds';

interface BingoBoardData extends BingoBoardType {
  banner_url?: string;
  game_icon?: string;
}

interface Activity {
  type: 'row' | 'column' | 'cell';
  index?: number;
  cellTask?: string;
  time: string;
  elapsed: string;
}

const BingoBoard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [board, setBoard] = useState<BingoBoardData | null>(null);
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSound } = useGameSounds();
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Multiplayer modal state
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  
  // Activity feed state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [canFinish, setCanFinish] = useState(false);
  
  // Ref to track processed completions to prevent duplicates
  const processedCompletions = React.useRef<{rows: Set<number>, cols: Set<number>}>({
    rows: new Set(),
    cols: new Set()
  });

  useEffect(() => {
    if (!id) return;
    fetchBoard(true);
  }, [id]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const fetchBoard = async (isInitialLoad = false) => {
    if (!userId) return;
    try {
      const data = await BingoService.getBoardDetail(id!, userId);
      
      // Auto-reset if 100% complete on load (New Game)
      // We check this BEFORE setting state to prevent showing completed board
      const completedCount = data.cells.filter(c => c.status === 'APPROVED').length;
      
      if (isInitialLoad && completedCount === data.cells.length && data.cells.length > 0) {
        await BingoService.resetBoard(parseInt(id!), userId);
        
        // Fetch again to get clean state
        const cleanData = await BingoService.getBoardDetail(id!, userId);
        setBoard(cleanData.board);
        setCells(cleanData.cells);
        setActivities([]);
        setCanFinish(false);
        // Reset processed completions ref
        processedCompletions.current = { rows: new Set(), cols: new Set() };
      } else {
        // Normal load or update
        setBoard(data.board);
        setCells(data.cells);
        
        // Check for completed rows/columns
        checkCompletions(data.cells, data.board.size);
        
        // Stop timer if 100% complete
        if (completedCount === data.cells.length && data.cells.length > 0) {
          setTimerActive(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch board:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkCompletions = (cellsData: BingoCell[], gridSize: number) => {
    const newActivities: Activity[] = [];
    
    // Check rows
    for (let row = 0; row < gridSize; row++) {
      const rowCells = cellsData.filter(c => c.row_index === row && c.status === 'APPROVED');
      if (rowCells.length === gridSize) {
        // Check if already processed using ref
        if (!processedCompletions.current.rows.has(row)) {
          processedCompletions.current.rows.add(row);
          newActivities.push({
            type: 'row',
            index: row,
            time: new Date().toLocaleTimeString(),
            elapsed: formatTime(elapsedTime),
          });
          playSound('win');
        }
      }
    }
    
    // Check columns
    for (let col = 0; col < gridSize; col++) {
      const colCells = cellsData.filter(c => c.col_index === col && c.status === 'APPROVED');
      if (colCells.length === gridSize) {
        // Check if already processed using ref
        if (!processedCompletions.current.cols.has(col)) {
          processedCompletions.current.cols.add(col);
          newActivities.push({
            type: 'column',
            index: col,
            time: new Date().toLocaleTimeString(),
            elapsed: formatTime(elapsedTime),
          });
          playSound('win');
        }
      }
    }
    
    if (newActivities.length > 0) {
      setActivities(prev => [...newActivities, ...prev]);
      setCanFinish(true);
    }
  };

  const handleCellClick = async (cell: BingoCell) => {
    if (cell.status === 'APPROVED') return;
    playSound('click');
    if (!timerActive) setTimerActive(true);
    if (!userId) return;
    
    try {
      await BingoService.completeCellDirect(cell.id, userId);
      playSound('complete');
      
      // Add cell completion to activity feed
      const newActivity: Activity = {
        type: 'cell',
        cellTask: cell.task,
        time: new Date().toLocaleTimeString(),
        elapsed: formatTime(elapsedTime),
      };
      setActivities(prev => [newActivity, ...prev]);
      
      fetchBoard();
    } catch (error) {
      console.error('Failed to complete cell:', error);
    }
  };
  
  const handleCreateRoom = async () => {
    if (!userId || !id) return;
    
    try {
      const room = await BingoRoomService.createRoom(parseInt(id), userId, maxPlayers, isPrivate, password);
      navigate(`/bingo/room/${room.id}?boardId=${id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };
  
  const handleRestart = async () => {
    if (!userId || !id) return;
    if (!confirm('Are you sure you want to restart? All progress will be lost.')) return;
    
    try {
      // Reset all cells for this user and board
      await BingoService.resetBoard(parseInt(id), userId);
      
      // Reset local state
      setElapsedTime(0);
      setTimerActive(false);
      setActivities([]);
      setCanFinish(false);
      processedCompletions.current = { rows: new Set(), cols: new Set() };
      
      // Refresh board
      fetchBoard();
    } catch (error) {
      console.error('Failed to restart:', error);
    }
  };
  
  const handleFinish = () => {
    setTimerActive(false);
    playSound('win');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    const message = completionPercentage === 100 
      ? `Congratulations! You completed the entire bingo in ${formatTime(elapsedTime)}!`
      : `Great job! You completed ${activities.filter(a => a.type !== 'cell').length} line(s) in ${formatTime(elapsedTime)}!`;
    
    setTimeout(() => {
      alert(message);
    }, 500);
  };
  
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingOverlay visible={true} />;
  if (!board) {
    return (
      <Container size="sm" py="xl">
        <Text size="xl" ta="center" c="dimmed">
          Bingo Board not found. Please check the URL or try again.
        </Text>
        <Button onClick={() => navigate('/bingo')} mt="md" fullWidth>
          Back to Bingo Challenges
        </Button>
      </Container>
    );
  }

  const theme = getGameTheme(board.game_name);
  const gridSize = board.size;
  const grid: BingoCell[][] = Array.from({ length: gridSize }, () => []);
  
  cells.forEach((cell) => {
    grid[cell.row_index][cell.col_index] = cell;
  });

  const completedCells = cells.filter(c => c.status === 'APPROVED').length;
  const totalCells = cells.length;
  const completionPercentage = Math.round((completedCells / totalCells) * 100);

  return (
    <Box style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Header */}
      <Container size="xl" pt="md">
        <Group justify="space-between" mb="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft />}
            onClick={() => navigate('/bingo')}
          >
            Back to Bingo Challenges
          </Button>
          
          <Group>
            {/* Timer */}
            <Paper p="sm" withBorder style={{ background: 'rgba(30, 30, 46, 0.5)' }}>
              <Group gap="xs">
                <IconClock size={20} />
                <Text fw={600} size="lg">{formatTime(elapsedTime)}</Text>
              </Group>
            </Paper>
            
            {/* Play Solo Button */}
            {!timerActive && completionPercentage < 100 && (
              <Button 
                color="green" 
                onClick={() => setTimerActive(true)}
                leftSection={<IconClock size={18} />}
              >
                Start Timer
              </Button>
            )}

            {/* Finish Button */}
            {canFinish && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  color="yellow" 
                  variant="filled"
                  onClick={handleFinish}
                  leftSection={<IconTrophy size={18} />}
                  className="animate-pulse"
                >
                  Finish Bingo!
                </Button>
              </motion.div>
            )}
            
            {/* Multiplayer Button */}
            <Button 
              variant="light" 
              color="blue" 
              leftSection={<IconUsers size={18} />}
              onClick={() => setCreateRoomModalOpen(true)}
            >
              Create Room
            </Button>
          </Group>
        </Group>

        <BingoHero 
          title={board.title}
          gameName={board.game_name}
          description={board.description}
          bannerUrl={board.banner_url}
          size={board.size}
        />
      </Container>

      <Container size="xl" mt="xl">
        <Grid>
          {/* Main Bingo Board */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Paper
              p={{ base: 'xs', md: 'xl' }}
              radius="md"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                border: `1px solid ${theme.primary}20`,
              }}
            >
              <Stack gap="xs">
                {grid.map((row, rowIndex) => (
                  <Group key={rowIndex} gap="xs" grow wrap="nowrap">
                    {row.map((cell) => {
                      const isCompleted = cell.status === 'APPROVED';
                      return (
                        <motion.div
                          key={cell.id}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ flex: 1 }}
                        >
                          <Paper
                            p={{ base: 4, sm: 'md' }}
                            withBorder
                            onClick={() => handleCellClick(cell)}
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
                                ? 'rgba(64, 192, 87, 0.15)' 
                                : 'var(--mantine-color-body)',
                              borderColor: isCompleted ? '#40c057' : undefined,
                              borderWidth: isCompleted ? 2 : 1,
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'hidden'
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
                                  <IconCheck size={16} color="#40c057" stroke={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Paper>
                        </motion.div>
                      );
                    })}
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Sidebar - Activity Feed */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Stack>
              {/* Progress Card */}
              <Card shadow="sm" padding="md" radius="md" withBorder>
                <Title order={4} mb="md">Progress</Title>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Completed</Text>
                  <Text fw={700}>{completedCells}/{totalCells}</Text>
                </Group>
                <Box 
                  w="100%" 
                  h={8} 
                  style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    h="100%" 
                    w={`${completionPercentage}%`}
                    bg="blue"
                    style={{ transition: 'width 0.5s ease' }}
                  />
                </Box>
                
                <Button 
                  variant="light" 
                  color="red" 
                  fullWidth 
                  mt="md" 
                  size="xs"
                  onClick={handleRestart}
                >
                  Restart Board
                </Button>
              </Card>

              {/* Activity Feed */}
              <Card shadow="sm" padding="md" radius="md" withBorder style={{ maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                <Title order={4} mb="md">Activity Log</Title>
                <Stack 
                  gap="sm" 
                  style={{ 
                    overflowY: 'auto', 
                    flex: 1,
                    paddingRight: '4px'
                  }}
                >
                  {activities.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="xl">
                      Start playing to see activity!
                    </Text>
                  ) : (
                    activities.map((activity, index) => (
                      <Paper key={index} p="xs" withBorder bg="rgba(0,0,0,0.2)">
                        <Group justify="space-between" align="start">
                          <Box style={{ flex: 1 }}>
                            <Text size="xs" c="dimmed">{activity.time} ({activity.elapsed})</Text>
                            <Text size="sm" fw={500}>
                              {activity.type === 'cell' && `Completed: ${activity.cellTask}`}
                              {activity.type === 'row' && `Completed Row ${activity.index! + 1} 🎯`}
                              {activity.type === 'column' && `Completed Column ${activity.index! + 1} 🎯`}
                            </Text>
                          </Box>
                          {activity.type !== 'cell' && (
                            <IconTrophy size={16} color="#FFD700" />
                          )}
                        </Group>
                      </Paper>
                    ))
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Create Room Modal */}
      <Modal 
        opened={createRoomModalOpen} 
        onClose={() => setCreateRoomModalOpen(false)} 
        title="Create Multiplayer Room"
        centered
      >
        <Stack>
          <NumberInput
            label="Max Players"
            value={maxPlayers}
            onChange={(val) => setMaxPlayers(Number(val))}
            min={2}
            max={10}
          />
          <Switch
            label="Private Room"
            checked={isPrivate}
            onChange={(event) => setIsPrivate(event.currentTarget.checked)}
          />
          {isPrivate && (
            <PasswordInput
              label="Room Password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="Enter room password"
            />
          )}
          <Button fullWidth onClick={handleCreateRoom} mt="md">
            Create Room
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
};

export default BingoBoard;
