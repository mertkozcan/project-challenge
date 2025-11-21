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
} from '@mantine/core';
import { BingoService, type BingoCell, type BingoBoard as BingoBoardType } from '@/services/bingo/bingo.service';
import { BingoRoomService } from '@/services/bingo/bingoRoom.service';
import { IconCheck, IconClock, IconArrowLeft, IconTrophy, IconUsers } from '@tabler/icons-react';
import { useAppSelector } from '@/store';
import BingoHero from '@/components/Bingo/BingoHero';
import { getGameTheme } from '@/utils/gameThemes';

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
  const { userId } = useAppSelector((state) => state.auth.userInfo);
  const [board, setBoard] = useState<BingoBoardData | null>(null);
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Multiplayer modal state
  const [createRoomModalOpen, setCreateRoomModalOpen] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);
  
  // Activity feed state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [canFinish, setCanFinish] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBoard();
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

  const fetchBoard = async () => {
    if (!userId) return;
    try {
      const data = await BingoService.getBoardDetail(id!, userId);
      setBoard(data.board);
      setCells(data.cells);
      
      // Check for completed rows/columns
      checkCompletions(data.cells, data.board.size);
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
        const existing = activities.find(a => a.type === 'row' && a.index === row);
        if (!existing) {
          newActivities.push({
            type: 'row',
            index: row,
            time: new Date().toLocaleTimeString(),
            elapsed: formatTime(elapsedTime),
          });
        }
      }
    }
    
    // Check columns
    for (let col = 0; col < gridSize; col++) {
      const colCells = cellsData.filter(c => c.col_index === col && c.status === 'APPROVED');
      if (colCells.length === gridSize) {
        const existing = activities.find(a => a.type === 'column' && a.index === col);
        if (!existing) {
          newActivities.push({
            type: 'column',
            index: col,
            time: new Date().toLocaleTimeString(),
            elapsed: formatTime(elapsedTime),
          });
        }
      }
    }
    
    if (newActivities.length > 0) {
      setActivities(prev => [...prev, ...newActivities]);
      setCanFinish(true);
    }
  };

  const handleCellClick = async (cell: BingoCell) => {
    if (cell.status === 'APPROVED') return;
    if (!timerActive) setTimerActive(true);
    if (!userId) return;
    
    try {
      await BingoService.completeCellDirect(cell.id, userId);
      
      // Add cell completion to activity feed
      const newActivity: Activity = {
        type: 'cell',
        cellTask: cell.task,
        time: new Date().toLocaleTimeString(),
        elapsed: formatTime(elapsedTime),
      };
      setActivities(prev => [...prev, newActivity]);
      
      fetchBoard();
    } catch (error) {
      console.error('Failed to complete cell:', error);
    }
  };
  
  const handleCreateRoom = async () => {
    if (!userId || !id) return;
    
    try {
      const room = await BingoRoomService.createRoom(parseInt(id), userId, maxPlayers);
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
      
      // Refresh board
      fetchBoard();
    } catch (error) {
      console.error('Failed to restart:', error);
    }
  };
  
  const handleFinish = () => {
    setTimerActive(false);
    const message = completionPercentage === 100 
      ? `Congratulations! You completed the entire bingo in ${formatTime(elapsedTime)}!`
      : `Great job! You completed ${activities.filter(a => a.type !== 'cell').length} line(s) in ${formatTime(elapsedTime)}!`;
    alert(message);
    
    // Reset progress after finishing
    if (userId && id) {
      BingoService.resetBoard(parseInt(id), userId).then(() => {
        setElapsedTime(0);
        setActivities([]);
        setCanFinish(false);
        fetchBoard();
      });
    }
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
            {!timerActive && (
              <Button
                leftSection={<IconTrophy size={20} />}
                onClick={() => setTimerActive(true)}
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
              >
                Play Solo
              </Button>
            )}
            
            {/* Finish Bingo Button */}
            {timerActive && (canFinish || completionPercentage === 100) && (
              <Button
                leftSection={<IconCheck size={20} />}
                onClick={handleFinish}
                variant="gradient"
                gradient={{ from: 'green', to: 'lime', deg: 45 }}
              >
                Finish Bingo
              </Button>
            )}
            
            {/* Restart Button */}
            <Button
              leftSection={<IconArrowLeft size={20} />}
              onClick={handleRestart}
              variant="outline"
              color="red"
            >
              Restart
            </Button>
            
            {/* Create Multiplayer Room Button */}
            <Button
              leftSection={<IconUsers size={20} />}
              onClick={() => setCreateRoomModalOpen(true)}
              variant="filled"
            >
              Create Multiplayer Room
            </Button>
          </Group>
        </Group>
      </Container>

      {/* Hero Section */}
      <Container size="xl">
        <BingoHero
          bannerUrl={board.banner_url}
          gameName={board.game_name}
          title={board.title}
          description={board.description}
          size={board.size}
        />
      </Container>

      {/* Progress Section */}
      <Container size="xl" mb="xl">
        <Paper
          p="xl"
          radius="md"
          style={{
            background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
            border: `1px solid ${theme.primary}20`,
          }}
        >
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed" mb="xs">
                Your Progress
              </Text>
              <Title order={2} c={theme.primary}>
                {completedCells} / {totalCells} Completed
              </Title>
            </div>
            <Box
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `conic-gradient(${theme.primary} ${completionPercentage * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(21, 21, 21, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <Text size="2rem" fw={700} c={theme.primary}>
                  {completionPercentage}%
                </Text>
              </Box>
            </Box>
          </Group>
        </Paper>
      </Container>

      {/* Main Content */}
      <Container size="xl" mb="xl">
        <Grid>
          {/* Bingo Grid - Left Side */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper
              p="xl"
              radius="md"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                border: `1px solid ${theme.primary}20`,
              }}
            >
              <Grid gutter="xs">
                {grid.map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {row.map((cell) => {
                      const isCompleted = cell.status === 'APPROVED';
                      
                      return (
                        <Grid.Col key={`${cell.row_index}-${cell.col_index}`} span={12 / gridSize}>
                          <Paper
                            p="lg"
                            radius="md"
                            onClick={() => handleCellClick(cell)}
                            style={{
                              cursor: isCompleted ? 'default' : 'pointer',
                              minHeight: '150px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              background: isCompleted
                                ? `linear-gradient(135deg, ${theme.primary}40, ${theme.secondary}40)`
                                : 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                              border: isCompleted
                                ? `2px solid ${theme.primary}`
                                : '1px solid rgba(255, 255, 255, 0.1)',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              if (!isCompleted) {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = `0 8px 24px ${theme.glow}`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {isCompleted && (
                              <Box style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                <IconTrophy size={32} color={theme.primary} />
                              </Box>
                            )}
                            
                            <Text
                              size="sm"
                              fw={600}
                              style={{
                                lineHeight: 1.4,
                                color: isCompleted ? theme.primary : 'white',
                              }}
                            >
                              {cell.task}
                            </Text>

                            <Group justify="space-between" mt="md">
                              <Badge
                                color={isCompleted ? 'green' : 'gray'}
                                variant="filled"
                                leftSection={isCompleted ? <IconCheck size={12} /> : null}
                              >
                                {isCompleted ? 'Completed' : 'Not Started'}
                              </Badge>
                            </Group>
                          </Paper>
                        </Grid.Col>
                      );
                    })}
                  </React.Fragment>
                ))}
              </Grid>
            </Paper>
          </Grid.Col>
          
          {/* Activity Feed - Right Side */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper
              p="lg"
              radius="md"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                border: `1px solid ${theme.primary}20`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Title order={3} mb="md" c={theme.primary}>
                Activity Feed
              </Title>
              
              <Box style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 400px)' }}>
                {activities.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    Complete cells to see activity here!
                  </Text>
                ) : (
                  <Stack gap="sm">
                    {activities.map((activity, idx) => {
                      const isLineCompletion = activity.type === 'row' || activity.type === 'column';
                      
                      return (
                        <Paper
                          key={idx}
                          p="md"
                          withBorder
                          style={{
                            background: isLineCompletion 
                              ? 'rgba(64, 192, 87, 0.2)' 
                              : 'rgba(30, 30, 46, 0.5)',
                            borderColor: isLineCompletion ? theme.primary : 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <Group justify="space-between">
                            <div style={{ flex: 1 }}>
                              {activity.type === 'cell' ? (
                                <>
                                  <Text fw={500} size="sm" c="white" lineClamp={2}>
                                    {activity.cellTask}
                                  </Text>
                                  <Text size="xs" c="dimmed" mt={4}>
                                    {activity.time} • {activity.elapsed}
                                  </Text>
                                </>
                              ) : (
                                <>
                                  <Text fw={600} size="sm" c={theme.primary}>
                                    ✓ Completed {activity.type === 'row' ? 'Row' : 'Column'} {activity.index! + 1}
                                  </Text>
                                  <Text size="xs" c="dimmed" mt={4}>
                                    {activity.time} • {activity.elapsed}
                                  </Text>
                                </>
                              )}
                            </div>
                            {isLineCompletion && <IconTrophy size={24} color={theme.primary} />}
                          </Group>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
      
      {/* Create Multiplayer Room Modal */}
      <Modal
        opened={createRoomModalOpen}
        onClose={() => setCreateRoomModalOpen(false)}
        title="Create Multiplayer Room"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Create a multiplayer room for this bingo board. Invite friends and compete to complete rows or columns first!
          </Text>

          <NumberInput
            label="Max Players"
            placeholder="4"
            min={2}
            max={8}
            value={maxPlayers}
            onChange={(value) => setMaxPlayers(Number(value))}
          />

          <Button 
            fullWidth 
            onClick={handleCreateRoom}
            style={{
              background: theme.gradient,
              boxShadow: `0 4px 20px ${theme.glow}`,
            }}
          >
            Create Room
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
};

export default BingoBoard;
