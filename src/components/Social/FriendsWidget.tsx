import React, { useState, useEffect } from 'react';
import {
  Paper,
  ActionIcon,
  Badge,
  Stack,
  Group,
  Avatar,
  Text,
  Button,
  Tabs,
  TextInput,
  Loader,
  Popover,
  Indicator,
  Tooltip,
  ScrollArea,
  Divider,
  Box,
  Transition
} from '@mantine/core';
import { 
  IconUsers, 
  IconUserPlus, 
  IconSearch, 
  IconCheck, 
  IconX, 
  IconTrash, 
  IconMessageCircle,
  IconChevronDown,
  IconChevronUp
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ApiService from '@/services/ApiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  trust_level: number;
  status: string;
}

interface FriendRequest {
  request_id: number;
  sender_id: string;
  username: string;
  avatar_url: string;
  created_at: string;
}

const FriendsWidget: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userActivities, setUserActivities] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();

      // Socket listeners
      const socket = (window as any).socket;
      if (socket) {
        socket.on('user-online', ({ userId }: { userId: string }) => {
          setOnlineUsers(prev => new Set(prev).add(userId));
          setUserActivities(prev => ({ ...prev, [userId]: 'Online' }));
        });

        socket.on('user-offline', ({ userId }: { userId: string }) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          setUserActivities(prev => {
            const newActivities = { ...prev };
            delete newActivities[userId];
            return newActivities;
          });
        });

        socket.on('user-activity', ({ userId, activity }: { userId: string; activity: string }) => {
          setUserActivities(prev => ({ ...prev, [userId]: activity }));
        });
      }

      return () => {
        if (socket) {
          socket.off('user-online');
          socket.off('user-offline');
          socket.off('user-activity');
        }
      };
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const res = await ApiService.fetchData<void, Friend[]>({ url: '/friends', method: 'GET' });
      setFriends(res.data);
    } catch (error) {
      console.error('Failed to fetch friends', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await ApiService.fetchData<void, FriendRequest[]>({ url: '/friends/requests', method: 'GET' });
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  const handleSendRequest = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      await ApiService.fetchData({
        url: '/friends/request',
        method: 'POST',
        data: { username: searchQuery },
      });
      notifications.show({
        title: 'Success',
        message: 'Friend request sent!',
        color: 'green',
      });
      setSearchQuery('');
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to send request',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await ApiService.fetchData({
        url: `/friends/accept/${requestId}`,
        method: 'PUT',
      });
      notifications.show({ title: 'Success', message: 'Friend request accepted!', color: 'green' });
      fetchRequests();
      fetchFriends();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to accept request', color: 'red' });
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    try {
      await ApiService.fetchData({
        url: `/friends/${friendId}`,
        method: 'DELETE',
      });
      notifications.show({ title: 'Success', message: 'Friend removed', color: 'blue' });
      fetchFriends();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to remove friend', color: 'red' });
    }
  };

  if (!user) return null;

  const onlineCount = friends.filter(f => onlineUsers.has(f.id)).length;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Transition transition="slide-up" mounted={opened}>
        {(styles) => (
          <Paper 
            style={{ ...styles, position: 'absolute', bottom: 60, right: 0, width: 320, height: 450, overflow: 'hidden' }} 
            withBorder 
            shadow="lg" 
            radius="md"
          >
            <Stack h="100%" gap={0}>
              <Box p="sm" bg="dark.6" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Group justify="space-between">
                  <Text fw={700} size="sm">Social</Text>
                  <ActionIcon variant="subtle" size="sm" onClick={() => setOpened(false)}>
                    <IconChevronDown size={16} />
                  </ActionIcon>
                </Group>
              </Box>

              <Tabs value={activeTab} onChange={setActiveTab} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Tabs.List grow>
                  <Tabs.Tab value="friends">Friends ({onlineCount}/{friends.length})</Tabs.Tab>
                  <Tabs.Tab value="requests">
                    Requests
                    {requests.length > 0 && (
                      <Badge ml={4} size="xs" color="red" circle>{requests.length}</Badge>
                    )}
                  </Tabs.Tab>
                  <Tabs.Tab value="add"><IconUserPlus size={16} /></Tabs.Tab>
                </Tabs.List>

                <ScrollArea style={{ flex: 1 }}>
                  <Tabs.Panel value="friends" p="xs">
                    {friends.length === 0 ? (
                      <Text c="dimmed" size="sm" ta="center" mt="xl">No friends yet.</Text>
                    ) : (
                      <Stack gap="xs">
                        {friends.map((friend) => (
                          <Paper key={friend.id} p="xs" withBorder bg="dark.8">
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap="xs" wrap="nowrap">
                                <Indicator 
                                  color={onlineUsers.has(friend.id) ? "green" : "gray"} 
                                  position="bottom-end" 
                                  offset={2} 
                                  size={8}
                                  withBorder
                                >
                                  <Avatar src={friend.avatar_url} size="sm" radius="xl" />
                                </Indicator>
                                <div style={{ overflow: 'hidden' }}>
                                  <Text size="sm" fw={500} truncate>{friend.username}</Text>
                                  {onlineUsers.has(friend.id) && userActivities[friend.id] && userActivities[friend.id] !== 'Online' && (
                                    <Text size="xs" c="blue.3" truncate>{userActivities[friend.id]}</Text>
                                  )}
                                </div>
                              </Group>
                              <ActionIcon 
                                variant="subtle" 
                                color="red" 
                                size="sm" 
                                onClick={() => handleRemoveFriend(friend.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Tabs.Panel>

                  <Tabs.Panel value="requests" p="xs">
                    {requests.length === 0 ? (
                      <Text c="dimmed" size="sm" ta="center" mt="xl">No pending requests.</Text>
                    ) : (
                      <Stack gap="xs">
                        {requests.map((req) => (
                          <Paper key={req.request_id} p="xs" withBorder bg="dark.8">
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap="xs" wrap="nowrap">
                                <Avatar src={req.avatar_url} size="sm" radius="xl" />
                                <div>
                                  <Text size="sm" fw={500} truncate>{req.username}</Text>
                                  <Text size="xs" c="dimmed">Sent {new Date(req.created_at).toLocaleDateString()}</Text>
                                </div>
                              </Group>
                              <Group gap={4}>
                                <ActionIcon color="green" variant="light" size="sm" onClick={() => handleAcceptRequest(req.request_id)}>
                                  <IconCheck size={14} />
                                </ActionIcon>
                                <ActionIcon color="red" variant="light" size="sm" onClick={() => handleRemoveFriend(req.sender_id)}>
                                  <IconX size={14} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Tabs.Panel>

                  <Tabs.Panel value="add" p="xs">
                    <Stack gap="xs">
                      <TextInput
                        placeholder="Username"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        rightSection={
                          <ActionIcon 
                            onClick={handleSendRequest} 
                            loading={loading} 
                            variant="filled" 
                            color="blue"
                            size="sm"
                          >
                            <IconUserPlus size={14} />
                          </ActionIcon>
                        }
                      />
                      <Text size="xs" c="dimmed" ta="center">
                        Enter a username to send a friend request.
                      </Text>
                    </Stack>
                  </Tabs.Panel>
                </ScrollArea>
              </Tabs>
            </Stack>
          </Paper>
        )}
      </Transition>

      <Indicator 
        label={requests.length} 
        color="red" 
        size={16} 
        disabled={requests.length === 0} 
        offset={4}
      >
        <Button
          size="md"
          radius="xl"
          color="blue"
          onClick={() => setOpened((o) => !o)}
          style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            height: 48,
            paddingLeft: 20,
            paddingRight: 20
          }}
          leftSection={opened ? <IconChevronDown size={20} /> : <IconUsers size={20} />}
        >
          Friends
        </Button>
      </Indicator>
    </div>
  );
};

export default FriendsWidget;
