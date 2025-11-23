import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Tabs,
  TextInput,
  Button,
  Group,
  Stack,
  Avatar,
  Text,
  Paper,
  ActionIcon,
  Badge,
  Loader,
  Alert,
} from '@mantine/core';
import { IconSearch, IconUserPlus, IconCheck, IconX, IconTrash, IconUser } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ApiService from '@/services/ApiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface Friend {
  id: string;
  username: string;
  avatar_url: string;
  trust_level: number;
  status: string; // 'ACCEPTED'
}

interface FriendRequest {
  request_id: number;
  sender_id: string;
  username: string;
  avatar_url: string;
  created_at: string;
}

const FriendsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userActivities, setUserActivities] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFriends();
    fetchRequests();

    // Socket listeners for online status
    const socket = (window as any).socket; // Access global socket instance
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
  }, []);

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

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Friends</Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="friends" leftSection={<IconUser size={16} />}>
            My Friends ({friends.length})
          </Tabs.Tab>
          <Tabs.Tab value="requests" leftSection={<IconUserPlus size={16} />}>
            Requests
            {requests.length > 0 && (
              <Badge ml="xs" color="red" size="xs" circle>
                {requests.length}
              </Badge>
            )}
          </Tabs.Tab>
          <Tabs.Tab value="add" leftSection={<IconSearch size={16} />}>
            Add Friend
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="friends">
          {friends.length === 0 ? (
            <Alert color="gray" icon={<IconUser size={16} />}>
              You haven't added any friends yet.
            </Alert>
          ) : (
            <Stack>
              {friends.map((friend) => (
                <Paper key={friend.id} p="md" withBorder radius="md">
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={friend.avatar_url} radius="xl" size="md" />
                      <div>
                        <Text fw={500}>{friend.username}</Text>
                        <Group gap="xs">
                          <Badge 
                            size="sm" 
                            variant="dot" 
                            color={onlineUsers.has(friend.id) ? "green" : "gray"}
                          >
                            {onlineUsers.has(friend.id) ? "Online" : "Offline"}
                          </Badge>
                          {onlineUsers.has(friend.id) && userActivities[friend.id] && userActivities[friend.id] !== 'Online' && (
                            <Badge size="sm" variant="light" color="blue">
                              {userActivities[friend.id]}
                            </Badge>
                          )}
                        </Group>
                      </div>
                    </Group>
                    <Button 
                      variant="subtle" 
                      color="red" 
                      size="xs" 
                      leftSection={<IconTrash size={14} />}
                      onClick={() => handleRemoveFriend(friend.id)}
                    >
                      Remove
                    </Button>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="requests">
          {requests.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">No pending requests.</Text>
          ) : (
            <Stack>
              {requests.map((req) => (
                <Paper key={req.request_id} p="md" withBorder radius="md">
                  <Group justify="space-between">
                    <Group>
                      <Avatar src={req.avatar_url} radius="xl" />
                      <div>
                        <Text fw={500}>{req.username}</Text>
                        <Text size="xs" c="dimmed">Sent {new Date(req.created_at).toLocaleDateString()}</Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Button 
                        size="xs" 
                        color="green" 
                        leftSection={<IconCheck size={14} />}
                        onClick={() => handleAcceptRequest(req.request_id)}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="xs" 
                        variant="default" 
                        leftSection={<IconX size={14} />}
                        onClick={() => handleRemoveFriend(req.sender_id)} // Reject logic same as remove for now
                      >
                        Reject
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="add">
          <Paper p="xl" withBorder radius="md">
            <Stack>
              <Text>Enter a username to send a friend request:</Text>
              <Group>
                <TextInput
                  placeholder="Username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1 }}
                  leftSection={<IconSearch size={16} />}
                />
                <Button onClick={handleSendRequest} loading={loading}>
                  Send Request
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default FriendsPage;
