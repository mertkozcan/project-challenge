import React from 'react';
import { Group, Paper } from '@mantine/core';
import NotificationBell from '@/components/Notifications/NotificationBell';

const Header: React.FC = () => {
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
      <Group justify="flex-end">
        <NotificationBell />
      </Group>
    </Paper>
  );
};

export default Header;
