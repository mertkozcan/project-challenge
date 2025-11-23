import React, { useEffect, useState } from 'react';
import { Modal, Stack, Text, Button, Group, Avatar, ScrollArea, TextInput, Loader, Badge } from '@mantine/core';
import { IconSearch, IconSend, IconCheck } from '@tabler/icons-react';
import { FriendService, FriendRequest } from '@/services/social/friend.service';
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
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (opened && user) {
      fetchFriends();
    }
  }, [opened, user]);

  const fetchFriends = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await FriendService.getFriends(user.id);
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
    if (!user) return;
    try {
      await BingoInvitationService.sendInvitation(roomId, friendId, user.id);
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
    const friendData = friend.user_id === user?.id ? friend.friend : friend.user;
    const matchesSearch = friendData.username.toLowerCase().includes(searchQuery.toLowerCase());
    const isAlreadyInRoom = currentParticipants.includes(friendData.id);
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
                const friendData = friend.user_id === user?.id ? friend.friend : friend.user;
                const isInvited = invitedUserIds.has(friendData.id);

                return (
                  <Group key={friend.id} justify="space-between" p="xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Group gap="sm">
                      <Avatar src={friendData.avatar_url} radius="xl" />
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{friendData.username}</Text>
                        {/* Could add online status here if available in friend object */}
                      </Stack>
                    </Group>
                    <Button
                      size="xs"
                      variant={isInvited ? "light" : "filled"}
                      color={isInvited ? "green" : "blue"}
                      leftSection={isInvited ? <IconCheck size={14} /> : <IconSend size={14} />}
                      onClick={() => !isInvited && handleInvite(friendData.id)}
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
