import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mantine/core';
import { BingoService, type BingoCell, type BingoBoard as BingoBoardType } from '@/services/bingo/bingo.service';
import { IconUpload, IconCheck, IconClock } from '@tabler/icons-react';

const BingoBoard: React.FC = () => {
  const { id } = useParams();
  const [board, setBoard] = useState<BingoBoardType | null>(null);
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
    try {
      const data = await BingoService.getBoardDetail(id!);
      setBoard(data.board);
      setCells(data.cells);
    } catch (error) {
      console.error('Failed to fetch board', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (cell: BingoCell) => {
    if (cell.status === 'APPROVED') return; // Already completed
    setSelectedCell(cell);
  };

  const handleUpload = async () => {
    if (!file || !selectedCell) return;
    setUploading(true);

    try {
      await BingoService.submitCellProof(selectedCell.id, '1', file);
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
  if (!board) return <Text>Board not found</Text>;

  // Create grid structure
  const gridSize = board.size;
  const grid: BingoCell[][] = Array.from({ length: gridSize }, () => []);
  
  cells.forEach((cell) => {
    grid[cell.row_index][cell.col_index] = cell;
  });

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="md">{board.title}</Title>
      <Text c="dimmed" mb="xl">{board.description}</Text>

      <Grid gutter="xs">
        {grid.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cell, colIndex) => (
              <Grid.Col key={`${rowIndex}-${colIndex}`} span={12 / gridSize}>
                <Paper
                  p="md"
                  withBorder
                  style={{
                    cursor: cell.status === 'APPROVED' ? 'default' : 'pointer',
                    backgroundColor:
                      cell.status === 'APPROVED'
                        ? '#2f9e44'
                        : cell.status === 'PENDING'
                        ? '#f59f00'
                        : '#1a1b1e',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                  onClick={() => handleCellClick(cell)}
                >
                  {cell.status === 'APPROVED' && <IconCheck size={24} color="white" />}
                  {cell.status === 'PENDING' && <IconClock size={24} color="white" />}
                  <Text size="sm" mt="xs" c="white">
                    {cell.task}
                  </Text>
                </Paper>
              </Grid.Col>
            ))}
          </React.Fragment>
        ))}
      </Grid>

      <Modal
        opened={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        title="Submit Proof"
      >
        {selectedCell && (
          <>
            <Text mb="md">{selectedCell.task}</Text>
            <FileInput
              placeholder="Upload proof"
              value={file}
              onChange={setFile}
              accept="image/*,video/*"
              leftSection={<IconUpload size={14} />}
              mb="md"
            />
            <Button onClick={handleUpload} loading={uploading} disabled={!file} fullWidth>
              Submit
            </Button>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default BingoBoard;
