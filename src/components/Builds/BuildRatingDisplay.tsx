import { Group, Rating, Text, Stack, Paper } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

interface BuildRatingDisplayProps {
  averageRating: number;
  ratingCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const BuildRatingDisplay = ({ 
  averageRating, 
  ratingCount, 
  size = 'md',
  showCount = true 
}: BuildRatingDisplayProps) => {
  const ratingSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const textSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  if (ratingCount === 0) {
    return (
      <Group gap="xs">
        <Rating value={0} readOnly size={size} />
        <Text size={textSize} c="dimmed">No ratings yet</Text>
      </Group>
    );
  }

  return (
    <Group gap="xs">
      <Rating value={averageRating || 0} fractions={2} readOnly size={size} />
      <Text size={textSize} fw={600}>
        {(averageRating || 0).toFixed(1)}
      </Text>
      {showCount && (
        <Text size={textSize} c="dimmed">
          ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
        </Text>
      )}
    </Group>
  );
};

export default BuildRatingDisplay;
