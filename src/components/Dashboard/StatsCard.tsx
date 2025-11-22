import React from 'react';
import { Card, Text, Group, ThemeIcon, Progress, Badge, Stack } from '@mantine/core';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  progress?: number;
  badge?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  description,
  progress,
  badge,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        shadow="md"
        padding="lg"
        radius="md"
        withBorder
        style={{
          cursor: onClick ? 'pointer' : 'default',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderColor: `${color}40`,
          height: '100%',
        }}
        onClick={onClick}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <ThemeIcon
              size="xl"
              radius="md"
              variant="light"
              color={color}
              style={{
                boxShadow: `0 4px 12px ${color}30`,
              }}
            >
              {icon}
            </ThemeIcon>
            {badge && (
              <Badge color={color} variant="light" size="sm">
                {badge}
              </Badge>
            )}
          </Group>

          <div>
            <Text size="sm" c="dimmed" fw={500}>
              {title}
            </Text>
            <Text size="xl" fw={700} mt={4}>
              {value}
            </Text>
            {description && (
              <Text size="xs" c="dimmed" mt={4}>
                {description}
              </Text>
            )}
          </div>

          {progress !== undefined && (
            <Progress
              value={progress}
              color={color}
              size="sm"
              radius="xl"
              striped
              animated={progress < 100}
            />
          )}
        </Stack>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
