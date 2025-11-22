import React from 'react';
import { Card, Text, Group, ThemeIcon, Stack, Badge } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  color,
  badge,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        withBorder
        style={{
          cursor: 'pointer',
          borderLeft: `4px solid var(--mantine-color-${color}-6)`,
          transition: 'all 0.2s ease',
        }}
        onClick={onClick}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <ThemeIcon
              size="lg"
              radius="md"
              variant="light"
              color={color}
            >
              {icon}
            </ThemeIcon>
            <Stack gap={2}>
              <Group gap="xs">
                <Text fw={600} size="sm">
                  {title}
                </Text>
                {badge && (
                  <Badge color={color} variant="dot" size="xs">
                    {badge}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            </Stack>
          </Group>
          <ThemeIcon
            size="sm"
            radius="xl"
            variant="subtle"
            color={color}
          >
            <IconChevronRight size={16} />
          </ThemeIcon>
        </Group>
      </Card>
    </motion.div>
  );
};

export default QuickActionCard;
