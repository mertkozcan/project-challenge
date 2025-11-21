import React from 'react';
import { Paper, Group, ThemeIcon, Text, MantineColor } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.FC<IconProps>;
  color: MantineColor;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, color, delay = 0 }) => {
  return (
    <Paper
      p="xl"
      radius="md"
      withBorder
      style={{
        animation: `fadeInUp 0.5s ease-out ${delay}s both`,
        background: 'rgba(255, 255, 255, 0.03)',
      }}
    >
      <Group>
        <ThemeIcon
          size="xl"
          radius="md"
          variant="light"
          color={color}
          style={{ width: 60, height: 60 }}
        >
          <Icon size={32} stroke={1.5} />
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {label}
          </Text>
          <Text size="xl" fw={700} fz={32}>
            {value}
          </Text>
        </div>
      </Group>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Paper>
  );
};

export default StatsCard;
