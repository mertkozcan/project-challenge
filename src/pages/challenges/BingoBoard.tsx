import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Grid,
  Paper,
  Modal,
  FileInput,
  Button,
  LoadingOverlay,
  Badge,
  Group,
  Box,
  Stack,
} from '@mantine/core';
import { BingoService, type BingoCell, type BingoBoard as BingoBoardType } from '@/services/bingo/bingo.service';
import { IconUpload, IconCheck, IconClock, IconArrowLeft, IconTrophy } from '@tabler/icons-react';
import { useAppSelector } from '@/store';
import BingoHero from '@/components/Bingo/BingoHero';
import { getGameTheme } from '@/utils/gameThemes';

interface BingoBoardData extends BingoBoardType {
  banner_url?: string;
  game_icon?: string;
}

const BingoBoard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAppSelector((state) => state.auth.userInfo);
  const [board, setBoard] = useState<BingoBoardData | null>(null);
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<BingoCell | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchBoard();
  }, [id]);

  const fetchBoard = async () => {
    if (!userId) return;
    try {
      console.log('Fetching bingo board with ID:', id, 'for user:', userId);
      const data = await BingoService.getBoardDetail(id!, userId);
      console.log('Bingo board data received:', data);
      setBoard(data.board);
      setCells(data.cells);
    } catch (error) {
      console.error('Failed to fetch board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (cell: BingoCell) => {
    if (cell.status === 'APPROVED') return; // Already completed
    setSelectedCell(cell);
  };

  const handleUpload = async () => {
    if (!file || !selectedCell || !userId) return;
    setUploading(true);

    try {
      await BingoService.submitCellProof(selectedCell.id, userId, file);
      setSelectedCell(null);
      setFile(null);
      fetchBoard(); // Refresh
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
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

  // Create grid structure
  const gridSize = board.size;
  const grid: BingoCell[][] = Array.from({ length: gridSize }, () => []);
  
  cells.forEach((cell) => {
    grid[cell.row_index][cell.col_index] = cell;
  });

  // Calculate completion
  const completedCells = cells.filter(c => c.status === 'APPROVED').length;
  const totalCells = cells.length;
  const completionPercentage = Math.round((completedCells / totalCells) * 100);

  return (
    <Box style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <Container size="xl" pt="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft />}
          onClick={() => navigate('/bingo')}
          mb="md"
        >
          Back to Bingo Challenges
        </Button>
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

      {/* Bingo Grid */}
      <Container size="xl">
        <Grid gutter="md">
          {grid.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isCompleted = cell.status === 'APPROVED';
                const isPending = cell.status === 'PENDING';
                
                return (
                  <Grid.Col key={`${rowIndex}-${colIndex}`} span={12 / gridSize}>
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
                          : isPending
                          ? 'linear-gradient(135deg, rgba(245, 159, 0, 0.2), rgba(245, 159, 0, 0.1))'
                          : 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                        border: isCompleted
                          ? `2px solid ${theme.primary}`
                          : isPending
                          ? '2px solid #f59f00'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
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
                        <Box
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                          }}
                        >
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
                          color={isCompleted ? 'green' : isPending ? 'yellow' : 'gray'}
                          variant="filled"
                          leftSection={
                            isCompleted ? (
                              <IconCheck size={12} />
                            ) : isPending ? (
                              <IconClock size={12} />
                            ) : null
                          }
                        >
                          {isCompleted ? 'Completed' : isPending ? 'Pending' : 'Not Started'}
                        </Badge>
                      </Group>
                    </Paper>
                  </Grid.Col>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Container>

      {/* Upload Modal */}
      <Modal
        opened={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        title="Submit Proof"
        centered
      >
        {selectedCell && (
          <Stack gap="md">
            <Text fw={600}>{selectedCell.task}</Text>
            <FileInput
              label="Upload Proof"
              placeholder="Choose image or video"
              accept="image/*,video/*"
              value={file}
              onChange={setFile}
              leftSection={<IconUpload size={16} />}
            />
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={!file}
              fullWidth
              style={{
                background: theme.gradient,
                boxShadow: `0 4px 20px ${theme.glow}`,
              }}
            >
              Submit Proof
            </Button>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default BingoBoard;
