import { Group, Text, Progress, Badge, Tooltip, Stack } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

interface UserLevelDisplayProps {
  level: number;
  totalXp: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

// XP calculation functions (matching backend)
const getXPForLevel = (level: number): number => {
  if (level <= 10) {
    return 100 * level;
  } else if (level <= 20) {
    return 1000 + 200 * (level - 10);
  } else if (level <= 30) {
    return 3000 + 400 * (level - 20);
  } else {
    return 7000 + 800 * (level - 30);
  }
};

const getTotalXPForLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

const getXPProgress = (totalXP: number) => {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded += getXPForLevel(level - 1);
  }
  
  level = level - 1;
  const xpForCurrentLevel = getTotalXPForLevel(level);
  const xpForNextLevel = getXPForLevel(level);
  const currentXP = totalXP - xpForCurrentLevel;
  const progress = (currentXP / xpForNextLevel) * 100;
  
  return {
    level,
    currentXP,
    xpForNextLevel,
    progress: Math.min(progress, 100)
  };
};

const UserLevelDisplay = ({ level, totalXp, size = 'md', showProgress = true }: UserLevelDisplayProps) => {
  const progress = getXPProgress(totalXp);
  
  const badgeSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const textSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  return (
    <Stack gap="xs">
      <Group gap="xs">
        <Tooltip label={`${totalXp.toLocaleString()} Total XP`}>
          <Badge 
            size={badgeSize}
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange' }}
            leftSection={<IconStar size={14} />}
          >
            Level {level}
          </Badge>
        </Tooltip>
      </Group>
      
      {showProgress && (
        <div>
          <Group justify="space-between" mb={4}>
            <Text size={textSize} c="dimmed">
              {Math.floor(progress.currentXP)} / {progress.xpForNextLevel} XP
            </Text>
            <Text size={textSize} c="dimmed">
              {Math.floor(progress.progress)}%
            </Text>
          </Group>
          <Progress 
            value={progress.progress} 
            size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
            color="yellow"
            animated
          />
        </div>
      )}
    </Stack>
  );
};

export default UserLevelDisplay;
