import React from 'react';
import { Text, Group, ActionIcon, Paper, ThemeIcon, Stack } from '@mantine/core';
import { IconBell, IconMail, IconDeviceGamepad2, IconUserPlus, IconTrash, IconCheck } from '@tabler/icons-react';
import { Notification } from '../../services/NotificationService';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, onDelete }) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'GAME_INVITE':
        return <IconDeviceGamepad2 size={16} />;
      case 'FRIEND_REQUEST':
        return <IconUserPlus size={16} />;
      case 'SYSTEM':
        return <IconBell size={16} />;
      default:
        return <IconMail size={16} />;
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'GAME_INVITE':
        return 'violet';
      case 'FRIEND_REQUEST':
        return 'blue';
      case 'SYSTEM':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const handleClick = () => {
    // Mark as read if not already
    if (!notification.is_read) {
      onRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'GAME_INVITE') {
      // Navigate to multiplayer rooms page
      navigate('/challenges/bingo/multiplayer');
    }
  };

  return (
    <Paper 
      p="sm" 
      withBorder 
      style={{
        backgroundColor: notification.is_read ? 'transparent' : 'var(--mantine-color-dark-6)',
        borderColor: notification.is_read ? 'var(--mantine-color-dark-4)' : `var(--mantine-color-${getColor()}-8)`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group wrap="nowrap">
          <ThemeIcon color={getColor()} variant="light" size="lg" radius="xl">
            {getIcon()}
          </ThemeIcon>
          <Stack gap={2} style={{ maxWidth: 200 }}>
            <Text size="sm" fw={500} lineClamp={1}>
              {notification.title}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={2}>
              {notification.message}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {dayjs(notification.created_at).fromNow()}
            </Text>
          </Stack>
        </Group>
        
        <Stack gap={4}>
          {!notification.is_read && (
            <ActionIcon 
              size="sm" 
              color="blue" 
              variant="subtle" 
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification.id);
              }}
              title="Mark as read"
            >
              <IconCheck size={14} />
            </ActionIcon>
          )}
          <ActionIcon 
            size="sm" 
            color="red" 
            variant="subtle" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            title="Delete"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Stack>
      </Group>
    </Paper>
  );
};

export default NotificationItem;
