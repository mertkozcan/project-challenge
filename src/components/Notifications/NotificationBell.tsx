import React, { useEffect, useState } from 'react';
import { 
  ActionIcon, 
  Indicator, 
  Popover, 
  Text, 
  Stack, 
  Group, 
  ThemeIcon, 
  Button, 
  ScrollArea,
  Box,
  Divider
} from '@mantine/core';
import { IconBell, IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { NotificationService, Notification } from '@/services/notification/notification.service';
import { useAppSelector } from '@/store';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const [notifs, count] = await Promise.all([
        NotificationService.getNotifications(userId),
        NotificationService.getUnreadCount(userId)
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await NotificationService.markAllAsRead(userId);
    fetchNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!userId) return;
    if (!notification.is_read) {
      await NotificationService.markAsRead(notification.id, userId);
      fetchNotifications();
    }
    
    // Navigate based on type if needed
    // For now just close popover
    // setOpened(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROOF_APPROVED':
        return <IconCheck size={16} />;
      case 'PROOF_REJECTED':
        return <IconX size={16} />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'PROOF_APPROVED':
        return 'green';
      case 'PROOF_REJECTED':
        return 'red';
      default:
        return 'blue';
    }
  };

  // if (!userId) return null; // Commented out for debugging

  return (
    <Popover 
      width={350} 
      position="bottom-end" 
      withArrow 
      shadow="md"
      opened={opened}
      onChange={setOpened}
      disabled={!userId}
    >
      <Popover.Target>
        <Indicator inline label={unreadCount} size={16} disabled={unreadCount === 0 || !userId} color="red">
          <ActionIcon 
            variant="subtle" 
            size="lg" 
            onClick={() => userId && setOpened((o) => !o)}
            aria-label="Notifications"
            disabled={!userId}
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box p="sm" bg="dark.7">
          <Group justify="space-between">
            <Text fw={700} size="sm">Notifications</Text>
            {unreadCount > 0 && (
              <Button variant="subtle" size="xs" onClick={handleMarkAllRead}>
                Mark all as read
              </Button>
            )}
          </Group>
        </Box>
        <Divider />
        
        <ScrollArea h={300}>
          {notifications.length > 0 ? (
            <Stack gap={0}>
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p="md"
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: notification.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Group align="flex-start" wrap="nowrap">
                    <ThemeIcon 
                      color={getColor(notification.type)} 
                      variant="light" 
                      size="md"
                      radius="xl"
                    >
                      {getIcon(notification.type)}
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500} mb={2}>
                        {notification.title}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
                        {notification.message}
                      </Text>
                      <Text size="xs" c="dimmed" mt={4} ta="right">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                    {!notification.is_read && (
                      <Box 
                        style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: '#fa5252' 
                        }} 
                      />
                    )}
                  </Group>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box p="xl" ta="center">
              <Text c="dimmed" size="sm">No notifications</Text>
            </Box>
          )}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
};

export default NotificationBell;
