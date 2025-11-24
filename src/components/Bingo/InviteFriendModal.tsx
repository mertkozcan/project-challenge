import React, { useEffect, useState } from 'react';
import { Modal, Stack, Text, Button, Group, Avatar, ScrollArea, TextInput, Loader } from '@mantine/core';
import { IconSearch, IconSend, IconCheck } from '@tabler/icons-react';
import { FriendService, Friend } from '@/services/social/friend.service';
import { BingoInvitationService } from '@/services/bingo/bingoInvitation.service';
import { useAppSelector } from '@/store';
import { notifications } from '@mantine/notifications';

interface InviteFriendModalProps {
  opened: boolean;
  onClose: () => void;
  roomId: string;
  currentParticipants: string[]; // User IDs already in the room
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ opened, onClose, roomId, currentParticipants }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
  const userId = useAppSelector((state) => state.auth.userInfo.userId);

  useEffect(() => {
    if (opened && userId) {
      fetchFriends();
    }
  }, [opened, userId]);

  const fetchFriends = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await FriendService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load friends list',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (friendId: string) => {
    if (!userId) return;
    try {
      await BingoInvitationService.sendInvitation(roomId, friendId, userId);
      setInvitedUserIds(prev => new Set(prev).add(friendId));
      notifications.show({
        title: 'Invitation Sent',
        message: 'Your friend has been invited!',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to send invitation',
        color: 'red',
      });
    }
  };

  const filteredFriends = friends.filter(friend => {
    if (!friend || !friend.username) return false;
    const matchesSearch = friend.username.toLowerCase().includes(searchQuery.toLowerCase());
    const isAlreadyInRoom = currentParticipants.includes(friend.id);
    return matchesSearch && !isAlreadyInRoom;
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Invite Friends" centered>
      <Stack>
        <TextInput
          placeholder="Search friends..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />

        <ScrollArea h={300}>
          {loading ? (
            <Group justify="center" p="xl">
              <Loader size="sm" />
            </Group>
          ) : filteredFriends.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              No friends found to invite.
            </Text>
          ) : (
            <Stack gap="sm">
              {filteredFriends.map((friend) => {
                const isInvited = invitedUserIds.has(friend.id);

                return (
                  <Group key={friend.id} justify="space-between" p="xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Group gap="sm">
                      <Avatar src={friend.avatar_url} radius="xl" />
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{friend.username}</Text>
                      </Stack>
                    </Group>
                    <Button
                      size="xs"
                      variant={isInvited ? "light" : "filled"}
                      color={isInvited ? "green" : "blue"}
                      leftSection={isInvited ? <IconCheck size={14} /> : <IconSend size={14} />}
                      onClick={() => !isInvited && handleInvite(friend.id)}
                      disabled={isInvited}
                    >
                      {isInvited ? 'Sent' : 'Invite'}
                    </Button>
                  </Group>
                );
              })}
            </Stack>
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export default InviteFriendModal;
