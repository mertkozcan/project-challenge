import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Grid, Card, Text, Badge, Button, LoadingOverlay, Group } from '@mantine/core';
import { BingoService, BingoBoard } from '@/services/bingo/bingo.service';
import { IconGridDots, IconUsers, IconHistory } from '@tabler/icons-react';

const BingoChallenges: React.FC = () => {
  const [boards, setBoards] = useState<BingoBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await BingoService.getBoards();
        setBoards(data);
      } catch (error) {
        console.error('Failed to fetch boards', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  if (loading) return <LoadingOverlay visible={true} />;

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Bingo Challenges</Title>
        <Group>
          <Button 
            variant="light" 
            leftSection={<IconUsers size={20} />}
            onClick={() => navigate('/bingo/rooms')}
          >
            Multiplayer Rooms
          </Button>
          <Button 
            variant="outline" 
            leftSection={<IconHistory size={20} />}
            onClick={() => navigate('/bingo/history')}
          >
            Game History
          </Button>
        </Group>
      </Group>

      <Grid>
        {boards.map((board) => (
          <Grid.Col key={board.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" withBorder>
              <IconGridDots size={48} style={{ marginBottom: '1rem' }} />
              <Text fw={700} size="lg" mb="xs">
                {board.title}
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                {board.game_name}
              </Text>
              <Text size="sm" mb="md" lineClamp={2}>
                {board.description}
              </Text>
              <Badge color="blue" mb="md">
                {board.size}x{board.size} Grid
              </Badge>
              <Button
                variant="light"
                fullWidth
                onClick={() => navigate(`/bingo/${board.id}`)}
              >
                Play Bingo
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {boards.length === 0 && (
        <Text c="dimmed" ta="center">No bingo boards available yet.</Text>
      )}
    </Container>
  );
};

export default BingoChallenges;