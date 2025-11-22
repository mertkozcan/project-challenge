import React from 'react';
import { SimpleGrid, Card, Text, Group, ThemeIcon, Stack, Progress } from '@mantine/core';
import { IconTrophy, IconClock, IconFlame, IconStar, IconTarget, IconChartBar } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface BingoStatsProps {
  stats: {
    total_games: number;
    solo_games: number;
    multiplayer_games: number;
    completed_solo_games: number;
    wins: number;
    win_rate: number;
    avg_completion_time: number;
    fastest_time: number;
    total_lines_completed: number;
    favorite_game: string | null;
  };
}

const BingoStatsCards: React.FC<BingoStatsProps> = ({ stats }) => {
  const formatTime = (seconds: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const statsCards = [
    {
      title: 'Total Games',
      value: stats.total_games,
      icon: <IconChartBar size={24} />,
      color: 'blue',
      description: `${stats.solo_games} solo, ${stats.multiplayer_games} multiplayer`,
    },
    {
      title: 'Win Rate',
      value: `${stats.win_rate}%`,
      icon: <IconTrophy size={24} />,
      color: 'yellow',
      description: `${stats.wins} wins out of ${stats.multiplayer_games} games`,
      progress: stats.win_rate,
    },
    {
      title: 'Avg Time',
      value: formatTime(stats.avg_completion_time),
      icon: <IconClock size={24} />,
      color: 'cyan',
      description: 'Average completion time',
    },
    {
      title: 'Fastest Time',
      value: formatTime(stats.fastest_time),
      icon: <IconFlame size={24} />,
      color: 'orange',
      description: 'Personal best',
    },
    {
      title: 'Lines Completed',
      value: stats.total_lines_completed,
      icon: <IconTarget size={24} />,
      color: 'green',
      description: 'Total bingo lines',
    },
    {
      title: 'Favorite Game',
      value: stats.favorite_game || 'N/A',
      icon: <IconStar size={24} />,
      color: 'grape',
      description: 'Most played',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 3, lg: 6 }} spacing="md">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <ThemeIcon size="lg" radius="md" variant="light" color={stat.color}>
                  {stat.icon}
                </ThemeIcon>
              </Group>
              
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.title}
                </Text>
                <Text size="xl" fw={700} mt={4}>
                  {stat.value}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {stat.description}
                </Text>
              </div>

              {stat.progress !== undefined && (
                <Progress
                  value={stat.progress}
                  color={stat.color}
                  size="sm"
                  radius="xl"
                  mt="xs"
                />
              )}
            </Stack>
          </Card>
        </motion.div>
      ))}
    </SimpleGrid>
  );
};

export default BingoStatsCards;
