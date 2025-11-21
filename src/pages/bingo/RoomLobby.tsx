import React, { useEffect, useState } from 'react';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay, Modal, Select, NumberInput } from '@mantine/core';
import { IconUsers, IconTrophy, IconPlus, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { BingoRoomService, BingoRoom } from '@/services/bingo/bingoRoom.service';
import { BingoService } from '@/services/bingo/bingo.service';
import { useAppSelector } from '@/store';

const BingoRoomLobby: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  
  const [availableRooms, setAvailableRooms] = useState<BingoRoom[]>([]);
  const [myRooms, setMyRooms] = useState<BingoRoom[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState(4);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rooms, myActiveRooms, bingoBoards] = await Promise.all([
        BingoRoomService.getAvailableRooms(),
        userId ? BingoRoomService.getUserRooms(userId) : Promise.resolve([]),
        BingoService.getBoards(),
      ]);
      setAvailableRooms(rooms);
      setMyRooms(myActiveRooms);
      setBoards(bingoBoards);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedBoardId) return;
    
    try {
      if (!userId) return;
      const room = await BingoRoomService.createRoom(parseInt(selectedBoardId), userId, maxPlayers);
      navigate(`/bingo/room/${room.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      if (!userId) return;
      await BingoRoomService.joinRoom(roomId, userId);
      navigate(`/bingo/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const RoomCard = ({ room }: { room: BingoRoom }) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={700} size="lg">{room.board_title}</Text>
          <Badge color={room.status === 'WAITING' ? 'green' : 'blue'}>
            {room.status === 'WAITING' ? 'Waiting' : 'In Progress'}
          </Badge>
        </Group>

        <Group gap="xs">
          <IconTrophy size={16} />
          <Text size="sm" c="dimmed">{room.game_name}</Text>
        </Group>

        <Group justify="space-between">
          <Group gap="xs">
            <Avatar size="sm" src={room.host_avatar} />
            <Text size="sm">Host: {room.host_username}</Text>
          </Group>
          
          <Group gap="xs">
            <IconUsers size={16} />
            <Text size="sm">{room.player_count}/{room.max_players}</Text>
          </Group>
        </Group>

        <Button 
          fullWidth 
          onClick={() => handleJoinRoom(room.id)}
          disabled={room.status !== 'WAITING' || (room.player_count || 0) >= room.max_players}
        >
          Join Room
        </Button>
      </Stack>
    </Card>
  );

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />

      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Multiplayer Bingo</Title>
          <Text c="dimmed">Join a room or create your own!</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={20} />}
          onClick={() => setCreateModalOpen(true)}
          size="lg"
        >
          Create Room
        </Button>
      </Group>

      {/* My Active Rooms */}
      {myRooms.length > 0 && (
        <>
          <Title order={2} mb="md">
            <Group gap="xs">
              <IconClock size={24} />
              My Active Rooms
            </Group>
          </Title>
          <Grid mb="xl">
            {myRooms.map((room) => (
              <Grid.Col key={room.id} span={{ base: 12, sm: 6, md: 4 }}>
                <RoomCard room={room} />
              </Grid.Col>
            ))}
          </Grid>
        </>
      )}

      {/* Available Rooms */}
      <Title order={2} mb="md">
        <Group gap="xs">
          <IconUsers size={24} />
          Available Rooms
        </Group>
      </Title>
      
      {availableRooms.length === 0 ? (
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" gap="md">
            <Text size="lg" c="dimmed">No rooms available</Text>
            <Text size="sm" c="dimmed">Be the first to create one!</Text>
            <Button onClick={() => setCreateModalOpen(true)}>Create Room</Button>
          </Stack>
        </Card>
      ) : (
        <Grid>
          {availableRooms.map((room) => (
            <Grid.Col key={room.id} span={{ base: 12, sm: 6, md: 4 }}>
              <RoomCard room={room} />
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Create Room Modal */}
      <Modal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Bingo Room"
        size="md"
      >
        <Stack gap="md">
          <Select
            label="Select Bingo Board"
            placeholder="Choose a board"
            data={boards.map(b => ({ value: String(b.id), label: `${b.title} (${b.game_name})` }))}
            value={selectedBoardId}
            onChange={(value) => setSelectedBoardId(value || '')}
            required
          />

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
            disabled={!selectedBoardId}
          >
            Create Room
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};

export default BingoRoomLobby;
