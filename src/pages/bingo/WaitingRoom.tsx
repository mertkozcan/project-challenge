import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay, Alert, Paper } from '@mantine/core';
import { IconUsers, IconCheck, IconX, IconPlayerPlay, IconDoorExit, IconAlertCircle } from '@tabler/icons-react';
import { BingoRoomService, RoomParticipant } from '@/services/bingo/bingoRoom.service';
import { useAppSelector } from '@/store';

const BingoWaitingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const userId = useAppSelector((state) => state.auth.userInfo.userId);

  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [myParticipant, setMyParticipant] = useState<RoomParticipant | null>(null);

  useEffect(() => {
    if (!roomId) return;
    fetchRoomData();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchRoomData, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    // If game started, navigate to game view
    if (room?.status === 'IN_PROGRESS') {
      navigate(`/bingo/room/${roomId}/play`);
    }
  }, [room?.status]);

  const fetchRoomData = async () => {
    if (!roomId) return;
    
    try {
      const data = await BingoRoomService.getRoomDetails(roomId);
      setRoom(data);
      setParticipants(data.participants || []);
      
      const me = data.participants?.find(p => p.user_id === userId);
      setMyParticipant(me || null);
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReady = async () => {
    if (!roomId) return;
    
    try {
      if (!userId) return;
      await BingoRoomService.toggleReady(roomId, userId);
      await fetchRoomData();
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  };

  const handleStartGame = async () => {
    if (!roomId) return;
    
    try {
      if (!userId) return;
      await BingoRoomService.startGame(roomId, userId);
      // Will navigate automatically via useEffect
    } catch (error) {
      console.error('Error starting game:', error);
      alert(error instanceof Error ? error.message : 'Failed to start game');
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    
    try {
      if (!userId) return;
      await BingoRoomService.leaveRoom(roomId, userId);
      // Navigate back to bingo board if boardId exists, otherwise to rooms
      navigate(boardId ? `/bingo/${boardId}` : '/bingo/rooms');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (!room) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle />} title="Room not found" color="red">
          This room doesn't exist or has been deleted.
        </Alert>
        <Button mt="md" onClick={() => navigate('/bingo/rooms')}>
          Back to Lobby
        </Button>
      </Container>
    );
  }

  const isHost = room.host_user_id === userId;
  const allReady = participants.every(p => p.is_ready);
  const canStart = isHost && allReady && participants.length >= 2;

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{room.board_title}</Title>
          <Text c="dimmed">{room.game_name} • Waiting for players...</Text>
        </div>
        <Badge size="lg" color="yellow">Waiting Room</Badge>
      </Group>

      <Grid>
        {/* Participants List */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              <Group gap="xs">
                <IconUsers size={24} />
                Players ({participants.length}/{room.max_players})
              </Group>
            </Title>

            <Stack gap="md">
              {participants.map((participant) => (
                <Paper key={participant.id} p="md" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={participant.avatar_url} size="md" />
                      <div>
                        <Text fw={500}>{participant.username}</Text>
                        {participant.user_id === room.host_user_id && (
                          <Badge size="sm" color="blue">Host</Badge>
                        )}
                      </div>
                    </Group>

                    {participant.is_ready ? (
                      <Badge color="green" leftSection={<IconCheck size={14} />}>
                        Ready
                      </Badge>
                    ) : (
                      <Badge color="gray" leftSection={<IconX size={14} />}>
                        Not Ready
                      </Badge>
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Actions */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {/* Ready Toggle */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">Your Status</Title>
              <Button
                fullWidth
                size="lg"
                color={myParticipant?.is_ready ? 'red' : 'green'}
                leftSection={myParticipant?.is_ready ? <IconX size={20} /> : <IconCheck size={20} />}
                onClick={handleToggleReady}
              >
                {myParticipant?.is_ready ? 'Not Ready' : 'Ready'}
              </Button>
            </Card>

            {/* Start Game (Host Only) */}
            {isHost && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">Game Control</Title>
                <Button
                  fullWidth
                  size="lg"
                  color="blue"
                  leftSection={<IconPlayerPlay size={20} />}
                  onClick={handleStartGame}
                  disabled={!canStart}
                >
                  Start Game
                </Button>
                {!allReady && (
                  <Text size="xs" c="dimmed" mt="xs">
                    All players must be ready
                  </Text>
                )}
                {participants.length < 2 && (
                  <Text size="xs" c="dimmed" mt="xs">
                    Need at least 2 players
                  </Text>
                )}
              </Card>
            )}

            {/* Leave Room */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Button
                fullWidth
                variant="light"
                color="red"
                leftSection={<IconDoorExit size={20} />}
                onClick={handleLeaveRoom}
              >
                Leave Room
              </Button>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default BingoWaitingRoom;
