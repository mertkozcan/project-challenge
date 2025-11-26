import React, { useEffect, useState } from 'react';
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Badge,
  Group,
  ActionIcon,
  Stack,
  Avatar,
  Title,
  ThemeIcon,
  LoadingOverlay,
  Button,
} from '@mantine/core';
import { IconHeart, IconTrophy, IconPlayerPlay, IconUsers } from '@tabler/icons-react';
import ProofService, { Proof } from '@/services/proof/proof.service';
import { notifications } from '@mantine/notifications';
import { useAppSelector } from '@/store';

interface CommunityProofsProps {
  challengeId: string | number;
}

const CommunityProofs: React.FC<CommunityProofsProps> = ({ challengeId }) => {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAppSelector((state) => state.auth.userInfo);

  useEffect(() => {
    fetchProofs();
  }, [challengeId]);

  const fetchProofs = async () => {
    try {
      const data = await ProofService.getProofsByChallenge(challengeId);
      // Filter only APPROVED proofs for public view
      setProofs(data.filter((p) => p.status === 'APPROVED'));
    } catch (error) {
      console.error('Failed to fetch proofs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proofId: number) => {
    if (!userId) {
      notifications.show({
        title: 'Login Required',
        message: 'You need to be logged in to vote.',
        color: 'red',
      });
      return;
    }

    try {
      const result = await ProofService.voteProof(proofId, userId);
      
      // Update local state
      setProofs((prev) =>
        prev.map((p) =>
          p.id === proofId
            ? { ...p, likes_count: result.likesCount }
            : p
        )
      );

      notifications.show({
        title: result.liked ? 'Upvoted!' : 'Vote Removed',
        message: result.liked ? 'You liked this proof.' : 'You removed your like.',
        color: result.liked ? 'green' : 'blue',
      });
    } catch (error) {
      console.error('Failed to vote', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to submit vote.',
        color: 'red',
      });
    }
  };

  if (loading) return <LoadingOverlay visible={true} />;

  if (proofs.length === 0) {
    return (
      <Stack align="center" py="xl" c="dimmed">
        <ThemeIcon size={60} radius="xl" variant="light" color="gray">
          <IconUsers size={30} />
        </ThemeIcon>
        <Text>No community proofs yet. Be the first!</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" mt="xl">
      <Title order={3}>Community Proofs</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {proofs.map((proof) => (
          <Card key={proof.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              {proof.media_type === 'video' ? (
                 <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                    {/* Placeholder for video thumbnail or embed */}
                    <Stack 
                        align="center" 
                        justify="center" 
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    >
                        <IconPlayerPlay size={40} color="white" />
                        <Text c="white" size="xs">Video Proof</Text>
                    </Stack>
                 </div>
              ) : (
                <Image
                  src={proof.media_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                  height={160}
                  alt="Proof"
                />
              )}
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Group gap="xs">
                <Avatar radius="xl" size="sm" />
                <Text fw={500} size="sm">{proof.username || 'Unknown User'}</Text>
              </Group>
              {proof.placement && proof.placement <= 3 && (
                <Badge 
                    color={proof.placement === 1 ? 'yellow' : proof.placement === 2 ? 'gray' : 'orange'} 
                    variant="filled"
                    leftSection={<IconTrophy size={12} />}
                >
                  {proof.placement === 1 ? '1st' : proof.placement === 2 ? '2nd' : '3rd'} Place
                </Badge>
              )}
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2}>
              Score: {proof.score} pts
            </Text>

            <Group justify="space-between" mt="md">
                <Text size="xs" c="dimmed">
                    {new Date(proof.created_at).toLocaleDateString()}
                </Text>
                <Group gap={4}>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleVote(proof.id)}>
                        <IconHeart size={18} />
                    </ActionIcon>
                    <Text size="sm">{proof.likes_count || 0}</Text>
                </Group>
            </Group>

            <Button 
                variant="light" 
                fullWidth 
                mt="md" 
                radius="md"
                component="a"
                href={proof.video_url || proof.media_url}
                target="_blank"
            >
              View Proof
            </Button>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default CommunityProofs;
