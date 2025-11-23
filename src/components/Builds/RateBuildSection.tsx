import { useState } from 'react';
import { Paper, Title, Rating, Text, Group, Button, Stack } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import BuildRatingService from '@/services/buildRating.service';

interface RateBuildSectionProps {
  buildId: number;
  userRating: number | null;
  onRatingSubmit: () => void;
}

const RateBuildSection = ({ buildId, userRating, onRatingSubmit }: RateBuildSectionProps) => {
  const [rating, setRating] = useState<number>(userRating || 0);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={4}>Rate this Build</Title>
        <Group>
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
          variant="light"
        >
          {userRating ? 'Update Rating' : 'Submit Rating'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default RateBuildSection;
