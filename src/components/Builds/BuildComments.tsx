import { useState, useEffect } from 'react';
import { Paper, Title, Textarea, Button, Stack, Group, Text, Avatar, ActionIcon, Divider } from '@mantine/core';
import { IconTrash, IconSend } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import BuildRatingService, { BuildComment } from '@/services/buildRating.service';
import { formatDistanceToNow } from 'date-fns';

interface BuildCommentsProps {
  buildId: number;
}

const BuildComments = ({ buildId }: BuildCommentsProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [comments, setComments] = useState<BuildComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [buildId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await BuildRatingService.getComments(buildId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      notifications.show({
        title: 'Comment Required',
        message: 'Please enter a comment',
        color: 'yellow',
      });
      return;
    }

    setSubmitting(true);
    try {
      await BuildRatingService.addComment(buildId, newComment);
      setNewComment('');
      notifications.show({
        title: 'Success',
        message: 'Comment posted!',
        color: 'green',
      });
      loadComments();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to post comment',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await BuildRatingService.deleteComment(commentId);
      notifications.show({
        title: 'Success',
        message: 'Comment deleted',
        color: 'green',
      });
      loadComments();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete comment',
        color: 'red',
      });
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Title order={4}>Comments ({comments.length})</Title>

        {/* Add Comment */}
        {user && (
          <Stack gap="sm">
            <Textarea
              placeholder="Share your thoughts about this build..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              minRows={3}
              maxRows={6}
            />
            <Group justify="flex-end">
              <Button
                onClick={handleSubmit}
                loading={submitting}
                leftSection={<IconSend size={16} />}
                disabled={!newComment.trim()}
              >
                Post Comment
              </Button>
            </Group>
          </Stack>
        )}

        {!user && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            Please login to comment
          </Text>
        )}

        <Divider />

        {/* Comments List */}
        {loading ? (
          <Text size="sm" c="dimmed" ta="center">Loading comments...</Text>
        ) : comments.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            No comments yet. Be the first to comment!
          </Text>
        ) : (
          <Stack gap="md">
            {comments.map((comment) => (
              <Paper key={comment.id} p="sm" withBorder radius="sm" bg="dark.7">
                <Group justify="space-between" mb="xs">
                  <Group gap="xs">
                    <Avatar src={comment.avatar_url} size="sm" radius="xl">
                      {comment.username[0].toUpperCase()}
                    </Avatar>
                    <div>
                      <Group gap="xs">
                        <Text size="sm" fw={600}>{comment.username}</Text>
                        {comment.level && (
                          <Text size="xs" c="dimmed">Lvl {comment.level}</Text>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </Text>
                    </div>
                  </Group>
                  {user?.userId === comment.user_id && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {comment.comment}
                </Text>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default BuildComments;
