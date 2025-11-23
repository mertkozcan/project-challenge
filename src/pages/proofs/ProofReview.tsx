import React, { useState, useEffect } from 'react';
import { 
  Container, Title, Grid, Card, Image, Text, Group, Badge, Button, 
  Stack, Textarea, ActionIcon, Alert, Loader, Divider 
} from '@mantine/core';
import { Container, Title, Card, Text, Group, Button, Stack, Image, Badge, ActionIcon, Alert, Grid } from '@mantine/core';
import { IconCheck, IconX, IconAlertTriangle, IconEye, IconVideo } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ApiService from '@/services/ApiService';
import TrustBadge from '@/components/Trust/TrustBadge';
import { useAppSelector } from '@/store';

interface Proof {
  id: number;
  challenge_title: string;
  game_name: string;
  display_username: string;
  status_screenshot_url: string;
  uploader_name: string;
  trust_level: number;
  ocr_result: string;
  ocr_extracted_text: string;
  video_url?: string;
  created_at: string;
}

const ProofReview: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const fetchPendingProofs = async () => {
    try {
      setLoading(true);
      const response = await ApiService.fetchData<void, { proofs: Proof[] }>({
        url: '/proofs/pending',
        method: 'GET'
      });
      setProofs(response.data.proofs);
    } catch (error) {
      console.error('Error fetching proofs:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load pending proofs',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProofs();
  }, []);

  const handleReview = async (proofId: number, decision: 'APPROVE' | 'REJECT') => {
    try {
      setSubmitting(proofId);
      await ApiService.fetchData({
        url: '/proofs/review',
        method: 'POST',
        data: { proofId, decision, comment }
      });

      notifications.show({
        title: 'Review Submitted',
        message: `Proof ${decision === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
        color: decision === 'APPROVE' ? 'green' : 'red'
      });

      // Remove reviewed proof from list
      setProofs(prev => prev.filter(p => p.id !== proofId));
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to submit review',
        color: 'red'
      });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center">
          <Loader size="lg" />
          <Text>Loading proofs for review...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Community Review</Title>

      {proofs.length === 0 ? (
        <Alert icon={<IconCheck size={16} />} title="All caught up!" color="green" variant="light">
          There are no pending proofs to review at the moment. Great job!
        </Alert>
      ) : (
        <Grid>
          {proofs.map((proof) => (
            <Grid.Col key={proof.id} span={{ base: 12, md: 6 }}>
              <Card withBorder shadow="sm" radius="md">
                <Card.Section>
                  <Image
                    src={proof.status_screenshot_url}
                    height={200}
                    alt="Proof Screenshot"
                    fallbackSrc="https://placehold.co/600x400?text=No+Image"
                  />
                </Card.Section>

                <Stack mt="md" gap="xs">
                  <Group justify="space-between">
                    <Badge color="blue">{proof.game_name}</Badge>
                    <TrustBadge level={proof.trust_level} size="sm" />
                  </Group>

                  <Text fw={700} size="lg">{proof.challenge_title}</Text>
                  
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">Uploader:</Text>
                    <Text size="sm" fw={500}>{proof.uploader_name}</Text>
                  </Group>

                  <Divider my="xs" />

                  <Text size="sm" fw={600}>Verification Checklist:</Text>
                  <Group gap="xs">
                    <IconEye size={16} color="gray" />
                    <Text size="sm">Character Name: <strong>{proof.display_username}</strong></Text>
                  </Group>

                  {proof.video_url && (
                    <Group gap="xs">
                      <IconVideo size={16} color="blue" />
                      <Text size="sm">
                        Video Proof: <a href={proof.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#228be6' }}>Watch Video</a>
                      </Text>
                    </Group>
                  )}

                  {proof.ocr_result && (
                    <Alert 
                      variant="light" 
                      color={proof.ocr_result === 'VERIFIED' ? 'green' : 'orange'} 
                      title="OCR Analysis"
                      icon={proof.ocr_result === 'VERIFIED' ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />}
                      py="xs"
                    >
                      <Text size="xs">
                        {proof.ocr_result === 'VERIFIED' 
                          ? 'Username detected in screenshot' 
                          : 'Username NOT detected automatically'}
                      </Text>
                    </Alert>
                  )}

                  <Textarea
                    placeholder="Optional comment..."
                    value={comment}
                    onChange={(e) => setComment(e.currentTarget.value)}
                    minRows={2}
                    mt="sm"
                  />

                  <Group grow mt="md">
                    <Button 
                      color="red" 
                      variant="light" 
                      leftSection={<IconX size={16} />}
                      loading={submitting === proof.id}
                      onClick={() => handleReview(proof.id, 'REJECT')}
                    >
                      Reject
                    </Button>
                    <Button 
                      color="green" 
                      leftSection={<IconCheck size={16} />}
                      loading={submitting === proof.id}
                      onClick={() => handleReview(proof.id, 'APPROVE')}
                    >
                      Approve
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProofReview;
