import React from 'react';
import { Group, Paper, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import NotificationBell from '@/components/Notifications/NotificationBell';
import UserLevelDisplay from '@/components/User/UserLevelDisplay';
import { IconSun, IconMoon } from '@tabler/icons-react';

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true });

  return (
    <Paper 
      p="md" 
      radius={0} 
      style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '1rem',
        background: 'transparent' // Or match theme background
      }}
    >
      <Group justify="flex-end" gap="md">
        <ActionIcon
          onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
          variant="filled"
          color={computedColorScheme === 'dark' ? 'yellow' : 'blue'}
          size="lg"
          radius="md"
          aria-label="Toggle color scheme"
        >
          {computedColorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>

        {user && user.userId && (
          <UserLevelDisplay 
            level={user.level || 1} 
            totalXp={user.total_xp || 0} 
            size="sm"
            showProgress={false}
          />
        )}
        <NotificationBell />
      </Group>
    </Paper>
  );
};

export default Header;
