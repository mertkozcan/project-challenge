import { useState, useEffect } from 'react';
import { Paper, Title, Rating, Text, Group, Button, Stack, Divider } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import BuildRatingService from '@/services/buildRating.service';

interface RateBuildSectionProps {
  buildId: number;
  userRating: number | null;
  onRatingSubmit: () => void;
  averageRating?: number;
  ratingCount?: number;
  theme?: any; // Game theme object
}

const RateBuildSection = ({ buildId, userRating, onRatingSubmit, averageRating, ratingCount, theme }: RateBuildSectionProps) => {
  const [rating, setRating] = useState<number>(userRating || 0);
  const [submitting, setSubmitting] = useState(false);

  // Sync rating with userRating prop when it changes
  useEffect(() => {
    setRating(userRating || 0);
  }, [userRating]);

  const handleSubmit = async () => {
    if (rating === 0) {
      notifications.show({
        title: 'Rating Required',
        message: 'Please select a rating before submitting',
        color: 'yellow',
      });
      return;
    }

    setSubmitting(true);
    try {
      await BuildRatingService.rateBuild(buildId, rating);
      notifications.show({
        title: 'Success',
        message: userRating ? 'Rating updated!' : 'Rating submitted!',
        color: 'green',
      });
      onRatingSubmit();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to submit rating',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = theme?.primary || '#228be6';
  const gradient = theme?.gradient || 'linear-gradient(45deg, #228be6, #339af0)';

  return (
    <Paper 
      shadow="md"
      p="xl"
      radius="md"
      style={{
        background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
        border: `1px solid ${primaryColor}20`,
      }}
    >
      <Stack gap="md">
        {averageRating !== undefined && ratingCount !== undefined && ratingCount > 0 && (
          <>
            <Title order={4} c={primaryColor}>Community Rating</Title>
            <Group justify="center" mb="xs">
              <IconStar size={32} color={primaryColor} fill={primaryColor} />
              <Text size="2rem" fw={700} c={primaryColor}>
                {Number(averageRating).toFixed(1)}
              </Text>
            </Group>
            <Text size="sm" c="dimmed" ta="center" mb="md">
              Based on {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
            </Text>
            <Divider />
          </>
        )}
        <Title order={4} c={primaryColor}>Rate this Build</Title>
        <Group justify="center">
          <Rating 
            value={rating} 
            onChange={setRating}
            size="lg"
            emptySymbol={<IconStar size={28} />}
            fullSymbol={<IconStar size={28} fill="currentColor" />}
          />
          {rating > 0 && (
            <Text size="sm" c="dimmed">
              {rating} {rating === 1 ? 'star' : 'stars'}
            </Text>
          )}
        </Group>
        <Button 
          onClick={handleSubmit} 
          loading={submitting}
          disabled={rating === 0}
          fullWidth
          size="lg"
          style={{
            background: gradient,
          }}
        >
          {userRating ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default RateBuildSection;
