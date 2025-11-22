import React from 'react';
import { Menu, ActionIcon, Indicator, Text, ScrollArea, Group, Button, Stack, Divider, Center } from '@mantine/core';
import { IconBell, IconCheck } from '@tabler/icons-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDropdown: React.FC = () => {
  const { notificationsList, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <Menu shadow="md" width={320} position="bottom-end" withArrow>
      <Menu.Target>
        <Indicator label={unreadCount} size={16} offset={4} color="red" disabled={unreadCount === 0} inline processing>
          <ActionIcon variant="transparent" size="lg" color="gray.4">
            <IconBell size={22} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        <Stack gap={0}>
          <Group p="sm" justify="space-between" bg="dark.7">
            <Text fw={600} size="sm">Notifications</Text>
            {unreadCount > 0 && (
              <Button 
                variant="subtle" 
                size="xs" 
                leftSection={<IconCheck size={12} />}
                onClick={() => markAllAsRead()}
              >
                Mark all read
              </Button>
            )}
          </Group>
          <Divider color="dark.5" />
          
          <ScrollArea style={{ height: 300 }} type="auto">
            {notificationsList.length > 0 ? (
              <Stack gap={0}>
                {notificationsList.map((notification) => (
                  <div key={notification.id} style={{ borderBottom: '1px solid #2C2E33' }}>
                    <NotificationItem 
                      notification={notification} 
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  </div>
                ))}
              </Stack>
            ) : (
              <Center h={200}>
                <Stack align="center" gap="xs">
                  <IconBell size={32} color="gray" style={{ opacity: 0.3 }} />
                  <Text c="dimmed" size="sm">No notifications</Text>
                </Stack>
              </Center>
            )}
          </ScrollArea>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export default NotificationDropdown;
