import React, { useEffect, useState } from 'react';
import { Stack, Text, Loader, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { RunSession, RunSessionService } from '@/services/runSession.service';
import { notifications } from '@mantine/notifications';
import ActiveRunCard from './ActiveRunCard';
import { useAppSelector } from '@/store';

interface ActiveRunListProps {
  compact?: boolean;
  onSessionCancelled?: () => void;
}

const ActiveRunList: React.FC<ActiveRunListProps> = ({ compact = false, onSessionCancelled }) => {
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [session, setSession] = useState<RunSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSession = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const activeSession = await RunSessionService.getActiveSession(userId);
      setSession(activeSession);
    } catch (error) {
      console.error('Error fetching active session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, [userId]);

  const handleCancel = async (sessionId: string) => {
    try {
      await RunSessionService.cancelSession(sessionId);
      
      notifications.show({
        title: 'Challenge Cancelled',
        message: 'Your active challenge has been cancelled.',
        color: 'orange',
      });
      
      setSession(null);
      onSessionCancelled?.();
    } catch (error) {
      console.error('Error cancelling session:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel challenge. Please try again.',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Stack align="center" py="md">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">Loading active challenges...</Text>
      </Stack>
    );
  }

  if (!session) {
    if (compact) return null;
    
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
        No active challenges. Start a new challenge to begin!
      </Alert>
    );
  }

  return (
    <ActiveRunCard 
      session={session} 
      onCancel={handleCancel} 
      compact={compact}
    />
  );
};

export default ActiveRunList;
