import React from 'react';
import { Group, Paper } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import NotificationBell from '@/components/Notifications/NotificationBell';
import UserLevelDisplay from '@/components/User/UserLevelDisplay';

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

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
