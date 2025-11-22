import React, { useEffect, useState } from 'react';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay, Modal, Select, NumberInput, Switch, PasswordInput } from '@mantine/core';
import { IconUsers, IconTrophy, IconPlus, IconClock, IconLock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { BingoRoomService, BingoRoom } from '@/services/bingo/bingoRoom.service';
import { BingoInvitationService, BingoInvitation } from '@/services/bingo/bingoInvitation.service';
import { BingoService } from '@/services/bingo/bingo.service';
import { useAppSelector } from '@/store';

const BingoRoomLobby: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  
  const [availableRooms, setAvailableRooms] = useState<BingoRoom[]>([]);
  const [myRooms, setMyRooms] = useState<BingoRoom[]>([]);
  const [invitations, setInvitations] = useState<BingoInvitation[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  
  // Join private room state
  const [joinPasswordModalOpen, setJoinPasswordModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [joinPassword, setJoinPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rooms, myActiveRooms, bingoBoards, myInvitations] = await Promise.all([
        BingoRoomService.getAvailableRooms(),
        userId ? BingoRoomService.getUserRooms(userId) : Promise.resolve([]),
        BingoService.getBoards(),
        userId ? BingoInvitationService.getMyInvitations(userId) : Promise.resolve([]),
      ]);
      setAvailableRooms(rooms);
      setMyRooms(myActiveRooms);
      setBoards(bingoBoards);
      setInvitations(myInvitations);
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
      const room = await BingoRoomService.createRoom(parseInt(selectedBoardId), userId, maxPlayers, isPrivate, password);
      navigate(`/bingo/room/${room.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleJoinClick = (room: BingoRoom) => {
    if (room.is_private) {
      setSelectedRoomId(room.id);
      setJoinPassword('');
      setJoinPasswordModalOpen(true);
    } else {
      handleJoinRoom(room.id);
    }
  };

  const handleJoinRoom = async (roomId: string, roomPassword?: string) => {
    console.log('Attempting to join room:', { roomId, userId, roomPassword });
    try {
      if (!userId) {
        console.error('❌ No userId found! User might not be logged in.');
        alert('Please log in to join a room.');
        return;
      }
      await BingoRoomService.joinRoom(roomId, userId, roomPassword);
      navigate(`/bingo/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please check the password and try again.');
    }
  };

  const handleInvitationResponse = async (invitationId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      if (!userId) return;
      const result = await BingoInvitationService.respondToInvitation(invitationId, status, userId);
      
      if (status === 'ACCEPTED') {
        navigate(`/bingo/room/${result.room_id}`);
      }
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error responding to invitation:', error);
    }
  };

  const RoomCard = ({ room }: { room: BingoRoom }) => {
    // Check if current user is already in this room
    const isUserInRoom = myRooms.some(r => r.id === room.id);
    const isFull = (room.player_count || 0) >= room.max_players;
    const isWaiting = room.status === 'WAITING';

    return (
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
            onClick={() => handleJoinClick(room)}
            disabled={!isUserInRoom && (!isWaiting || isFull)}
            leftSection={room.is_private ? <IconLock size={16} /> : null}
            variant={isUserInRoom ? "filled" : room.is_private ? "outline" : "filled"}
            color={isUserInRoom ? "green" : undefined}
          >
            {isUserInRoom ? 'Enter Room' : room.is_private ? 'Join Private Room' : 'Join Room'}
          </Button>
        </Stack>
      </Card>
    );
  };

  return (
    <Container size="xl" py={{ base: 'md', md: 'xl' }}>
      <LoadingOverlay visible={loading} />

      {/* Header */}
      <Group justify="space-between" mb={{ base: 'md', md: 'xl' }}>
        <div>
          <Title order={1} size="h2">Multiplayer Bingo</Title>
          <Text c="dimmed" size="sm">Join a room or create your own!</Text>
        </div>
        <Button 
          leftSection={<IconPlus size={20} />}
          onClick={() => {
            if (!userId) {
              navigate('/sign-in', { state: { message: 'You need to be logged in to create a room.' } });
            } else {
              setCreateModalOpen(true);
            }
          }}
          size="md"
        >
          Create Room
        </Button>
      </Group>

      {/* Invitations */}
      {invitations.length > 0 && (
        <>
          <Title order={2} mb="md">
            <Group gap="xs">
              <IconUsers size={24} />
              Pending Invitations
            </Group>
          </Title>
          <Grid mb="xl">
            {invitations.map((invitation) => (
              <Grid.Col key={invitation.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ borderColor: '#fab005', borderWidth: 2 }}>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Text fw={700} size="lg">Invitation to Play!</Text>
                      <Badge color="yellow">Pending</Badge>
                    </Group>

                    <Group gap="xs">
                      <Avatar size="sm" src={invitation.from_avatar} />
                      <Text size="sm">From: {invitation.from_username}</Text>
                    </Group>

                    <Text size="sm" c="dimmed">
                      Invited you to play <b>{invitation.board_title}</b> ({invitation.game_name})
                    </Text>

                    <Group grow>
                      <Button 
                        variant="outline" 
                        color="red" 
                        onClick={() => handleInvitationResponse(invitation.id, 'DECLINED')}
                      >
                        Decline
                      </Button>
                      <Button 
                        variant="filled" 
                        color="green" 
                        onClick={() => handleInvitationResponse(invitation.id, 'ACCEPTED')}
                      >
                        Accept
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </>
      )}

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
            <Button onClick={() => {
  if (!userId) {
    navigate('/sign-in', { state: { message: 'You need to be logged in to create a room.' } });
  } else {
    setCreateModalOpen(true);
  }
}}>
  Create Room
</Button>
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

          <Switch
            label="Private Room"
            checked={isPrivate}
            onChange={(event) => setIsPrivate(event.currentTarget.checked)}
          />

          {isPrivate && (
            <PasswordInput
              label="Room Password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          )}

          <Button 
            fullWidth 
            onClick={handleCreateRoom}
            disabled={!selectedBoardId}
          >
            Create Room
          </Button>
        </Stack>
      </Modal>

      {/* Join Private Room Modal */}
      <Modal
        opened={joinPasswordModalOpen}
        onClose={() => setJoinPasswordModalOpen(false)}
        title="Enter Room Password"
        size="sm"
      >
        <Stack gap="md">
          <PasswordInput
            label="Password"
            placeholder="Enter room password"
            value={joinPassword}
            onChange={(event) => setJoinPassword(event.currentTarget.value)}
            autoFocus
          />
          <Button 
            fullWidth 
            onClick={() => selectedRoomId && handleJoinRoom(selectedRoomId, joinPassword)}
          >
            Join Room
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
};

export default BingoRoomLobby;
