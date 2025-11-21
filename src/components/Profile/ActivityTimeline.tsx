import React from 'react';
import { Timeline, Text, ThemeIcon, Paper, Group, Badge } from '@mantine/core';
import { IconCheck, IconTrophy, IconSword } from '@tabler/icons-react';
import { UserActivity } from '@/services/userStats/userStats.service';

interface ActivityTimelineProps {
  activities: UserActivity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Paper p="xl" withBorder radius="md" ta="center">
        <Text c="dimmed">No recent activity found.</Text>
      </Paper>
    );
  }

  return (
    <Timeline active={-1} bulletSize={32} lineWidth={2}>
      {activities.map((activity) => (
        <Timeline.Item
          key={activity.id}
          bullet={
            <ThemeIcon
              size={32}
              radius="xl"
              color={activity.type === 'permanent' ? 'blue' : 'green'}
            >
              <IconTrophy size={18} />
            </ThemeIcon>
          }
          title={
            <Text fw={600} size="sm">
              Completed "{activity.challenge_name}"
            </Text>
          }
        >
          <Text c="dimmed" size="xs" mt={4}>
            {activity.game_name} • {new Date(activity.created_at).toLocaleDateString()}
          </Text>
          <Group mt={4}>
            <Badge size="sm" variant="light" color="yellow">
              {activity.score} Points
            </Badge>
          </Group>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default ActivityTimeline;
