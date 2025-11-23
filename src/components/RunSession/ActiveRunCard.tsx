import React from 'react';
import { Card, Group, Text, Badge, Button, Stack, ThemeIcon, ActionIcon, Tooltip } from '@mantine/core';
import { IconClock, IconX, IconSword, IconTrophy } from '@tabler/icons-react';
import { RunSession } from '@/services/runSession.service';
import { formatDistanceToNow } from 'date-fns';

interface ActiveRunCardProps {
  session: RunSession;
  onCancel?: (sessionId: string) => void;
  onComplete?: (session: RunSession) => void;
  compact?: boolean;
}

const ActiveRunCard: React.FC<ActiveRunCardProps> = ({ session, onCancel, onComplete, compact = false }) => {
  const getTimeRemaining = () => {
    // Permanent challenges don't expire
    if (!session.expires_at) {
      return null;
    }
    
    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h ${minutes}m remaining`;
  };

  const getElapsedTime = () => {
    return formatDistanceToNow(new Date(session.started_at), { addSuffix: true });
  };

  const getChallengeTypeLabel = () => {
    const types: Record<string, { label: string; color: string }> = {
      daily: { label: 'Daily', color: 'orange' },
      weekly: { label: 'Weekly', color: 'blue' },
      permanent: { label: 'Permanent', color: 'green' },
      bingo: { label: 'Bingo', color: 'violet' },
    };
    return types[session.challenge_type || 'permanent'] || types.permanent;
  };

  const typeInfo = getChallengeTypeLabel();
  const timeRemaining = getTimeRemaining();

  if (compact) {
    return (
      <Card withBorder padding="sm" radius="md">
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconSword size={14} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={600}>{session.display_username}</Text>
              <Text size="xs" c="dimmed">{session.game_name}</Text>
            </div>
          </Group>
          
          <Group gap="xs">
            <Badge size="sm" variant="light" color={typeInfo.color}>
              {typeInfo.label}
            </Badge>
            {onCancel && (
              <Tooltip label="Cancel run">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => onCancel(session.id)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Card>
    );
  }

  return (
    <Card withBorder shadow="sm" padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="sm">
            <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              <IconTrophy size={24} />
            </ThemeIcon>
            <div>
              <Text size="lg" fw={700}>Active Challenge</Text>
              <Text size="sm" c="dimmed">{session.game_name}</Text>
            </div>
          </Group>
          
          <Badge size="lg" variant="dot" color={typeInfo.color}>
            {typeInfo.label}
          </Badge>
        </Group>

        <Card withBorder padding="md" radius="sm" bg="dark.6">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Character Name:</Text>
              <Text size="md" fw={600} c="blue">
                {session.display_username}
              </Text>
            </Group>
            
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Started:</Text>
              <Text size="sm">{getElapsedTime()}</Text>
            </Group>
            
            {timeRemaining && (
              <Group justify="space-between">
                <Group gap={4}>
                  <IconClock size={14} />
                  <Text size="sm" c="dimmed">Expires:</Text>
                </Group>
                <Text size="sm" c="orange">{timeRemaining}</Text>
              </Group>
            )}
          </Stack>
        </Card>

        <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
          💡 <strong>Remember:</strong> Set your in-game character name to{' '}
          <Text component="span" fw={700} c="blue">
            {session.display_username}
          </Text>{' '}
          before completing the challenge. You'll need to show this in your proof screenshot.
        </Text>

        <Group grow>
          {onCancel && (
            <Button
              variant="light"
              color="red"
              leftSection={<IconX size={16} />}
              onClick={() => onCancel(session.id)}
            >
              Cancel
            </Button>
          )}
          
          {onComplete && (
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              leftSection={<IconTrophy size={16} />}
              onClick={() => onComplete(session)}
            >
              Submit Proof
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default ActiveRunCard;
