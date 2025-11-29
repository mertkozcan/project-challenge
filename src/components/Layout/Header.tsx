import React from 'react';
import { Group, Paper, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import NotificationBell from '@/components/Notifications/NotificationBell';
import UserLevelDisplay from '@/components/User/UserLevelDisplay';
import { IconSun, IconMoon } from '@tabler/icons-react';

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
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
          variant="default"
          size="lg"
          aria-label="Toggle color scheme"
        >
          {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>

        {user && (
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
