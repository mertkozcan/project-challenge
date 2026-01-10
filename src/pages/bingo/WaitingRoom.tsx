import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Title, Grid, Card, Text, Button, Group, Badge, Stack, Avatar, LoadingOverlay, Alert, Paper, Modal, TextInput, ActionIcon } from '@mantine/core';
import { IconUsers, IconCheck, IconX, IconPlayerPlay, IconDoorExit, IconAlertCircle, IconUserPlus, IconSearch } from '@tabler/icons-react';
import { BingoRoomService, RoomParticipant } from '@/services/bingo/bingoRoom.service';
import { BingoInvitationService } from '@/services/bingo/bingoInvitation.service';
import ApiService from '@/services/ApiService';
import { useAppSelector } from '@/store';
import SocketService from '@/services/socket.service';

import InviteFriendModal from '@/components/Bingo/InviteFriendModal';
import { useTranslation } from 'react-i18next';

const BingoWaitingRoom: React.FC = () => {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('boardId');
  const userId = useAppSelector((state) => state.auth.userInfo.userId);

  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [myParticipant, setMyParticipant] = useState<RoomParticipant | null>(null);
  
  // Invitation state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (!roomId || !userId) return;

    // Connect to WebSocket
    const socket = SocketService.connect();
    SocketService.joinRoom(roomId, userId);

    // Initial data fetch
    fetchRoomData();

    // Listen for real-time events
    SocketService.on('player-joined', handlePlayerJoined);
    SocketService.on('player-left', handlePlayerLeft);
    SocketService.on('player-ready-changed', handlePlayerReadyChanged);
    SocketService.on('game-started', handleGameStarted);
    SocketService.on('room-closed', handleRoomClosed);

    return () => {
      // Cleanup
      SocketService.leaveRoom(roomId, userId);
      SocketService.off('player-joined', handlePlayerJoined);
      SocketService.off('player-left', handlePlayerLeft);
      SocketService.off('player-ready-changed', handlePlayerReadyChanged);
      SocketService.off('game-started', handleGameStarted);
      SocketService.off('room-closed', handleRoomClosed);
    };
  }, [roomId, userId]);

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

  const handlePlayerJoined = async () => {
    await fetchRoomData();
  };

  const handlePlayerLeft = async () => {
    await fetchRoomData();
  };

  const handlePlayerReadyChanged = async () => {
    await fetchRoomData();
  };

  const handleGameStarted = () => {
    console.log('Game started event received, navigating to game view...');
    navigate(`/bingo/room/${roomId}/play`);
  };

  const handleRoomClosed = (data: { reason: string }) => {
    console.log('Room closed:', data.reason);
    alert(`Room was closed: ${data.reason}`);
    navigate('/bingo/rooms');
  };

  const handleToggleReady = async () => {
    if (!roomId || !userId) return;
    
    // Emit to WebSocket
    SocketService.toggleReady(roomId, userId);
  };

  const handleStartGame = async () => {
    if (!roomId || !userId) return;
    
    console.log('Starting game...', { roomId, userId });
    try {
      // Emit to WebSocket
      SocketService.startGame(roomId, userId);
      console.log('Start game event emitted');
    } catch (error) {
      console.error('Error starting game:', error);
      alert(t('bingo.startGameFailed'));
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    
    try {
      if (!userId) return;
      await BingoRoomService.leaveRoom(roomId, userId);
      navigate(boardId ? `/bingo/${boardId}` : '/bingo/rooms');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  if (loading) {
    return <LoadingOverlay visible />;
  }

  const isHost = room?.host_user_id === userId;
  const allReady = participants.every(p => p.is_ready);
  const canStart = isHost && allReady && participants.length >= 2;

  return (
    <Container size="lg" py="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>{room?.board_title}</Title>
          <Text c="dimmed">{room?.game_name}</Text>
        </div>
        <Group>
          <Badge size="lg" color="yellow">{t('common.waiting')}</Badge>
          <Button 
            variant="light" 
            color="red" 
            leftSection={<IconDoorExit size={16} />}
            onClick={handleLeaveRoom}
          >
            {t('bingo.leaveRoom')}
          </Button>
        </Group>
      </Group>

      {/* Room Info */}
      <Alert icon={<IconAlertCircle size={16} />} title={t('bingo.waitingForPlayers')} color="blue" mb="xl">
        {t('bingo.playersJoined', { count: participants.length, max: room?.max_players })}
        {!allReady && ` ${t('bingo.notAllReady')}`}
        {allReady && participants.length < 2 && ` ${t('bingo.waitingForMore')}`}
        {canStart && ` ${t('bingo.allReadyStart')}`}
      </Alert>

      <Grid>
        {/* Participants */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={3}>
                <Group gap="xs">
                  <IconUsers size={24} />
                  {t('bingo.players')} ({participants.length}/{room?.max_players})
                </Group>
              </Title>
              {isHost && (
                <Button
                  leftSection={<IconUserPlus size={16} />}
                  variant="light"
                  onClick={() => setInviteModalOpen(true)}
                >
                  {t('bingo.inviteFriends')}
                </Button>
              )}
            </Group>

            <Stack gap="md">
              {participants.map((participant) => (
                <Paper key={participant.id} p="md" withBorder>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Avatar src={participant.avatar_url} size="md" />
                      <div>
                        <Text fw={500}>
                          {participant.username}
                          {participant.user_id === userId && ` (${t('common.you')})`}
                          {participant.user_id === room?.host_user_id && ' 👑'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {participant.user_id === room?.host_user_id ? t('bingo.host') : t('bingo.player')}
                        </Text>
                      </div>
                    </Group>
                    <Badge 
                      color={participant.is_ready ? 'green' : 'gray'}
                      leftSection={participant.is_ready ? <IconCheck size={14} /> : <IconX size={14} />}
                    >
                      {participant.is_ready ? t('common.ready') : t('common.notReady')}
                    </Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Actions */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">{t('bingo.yourStatus')}</Title>
              <Button
                fullWidth
                variant={myParticipant?.is_ready ? 'filled' : 'light'}
                color={myParticipant?.is_ready ? 'green' : 'blue'}
                leftSection={myParticipant?.is_ready ? <IconCheck size={16} /> : <IconX size={16} />}
                onClick={handleToggleReady}
              >
                {myParticipant?.is_ready ? t('common.ready') : t('bingo.markAsReady')}
              </Button>
            </Card>

            {isHost && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">{t('bingo.hostControls')}</Title>
                <Button
                  fullWidth
                  color="green"
                  leftSection={<IconPlayerPlay size={16} />}
                  disabled={!canStart}
                  onClick={handleStartGame}
                >
                  {t('bingo.startGame')}
                </Button>
                {!canStart && (
                  <Text size="xs" c="dimmed" mt="xs" ta="center">
                    {!allReady ? t('bingo.allMustBeReady') : t('bingo.needTwoPlayers')}
                  </Text>
                )}
              </Card>
            )}

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">{t('bingo.gameRules')}</Title>
              <Stack gap="xs">
                <Text size="sm">• {t('bingo.rulesCompleteTasks')}</Text>
                <Text size="sm">• {t('bingo.rulesFirstWins')}</Text>
                <Text size="sm">• {t('bingo.rulesAllMustBeReady')}</Text>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Invite Modal */}
      <InviteFriendModal
        opened={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        roomId={roomId || ''}
        currentParticipants={participants.map(p => p.user_id)}
      />
    </Container>
  );
};

export default BingoWaitingRoom;
