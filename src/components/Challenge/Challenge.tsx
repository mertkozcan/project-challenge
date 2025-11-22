import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  FileInput,
  Group,
  LoadingOverlay,
  Badge,
  Notification,
  Grid,
  Box,
  Stack,
  Divider,
} from '@mantine/core';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { Challenge } from '@/@types/challenge';
import {
  IconUpload,
  IconArrowLeft,
  IconCheck,
  IconX,
  IconCoin,
  IconCheckbox,
} from '@tabler/icons-react';
import ApiService from '@/services/ApiService';
import { useAppSelector } from '@/store';
import ChallengeHero from './ChallengeHero';
import EnhancedLeaderboard from './EnhancedLeaderboard';
import { getGameTheme } from '@/utils/gameThemes';

interface ChallengeData extends Challenge {
  banner_url?: string;
  participant_count?: number;
  user_participated?: boolean;
  user_proof_status?: string;
}

import useAuth from '@/utils/hooks/useAuth';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAppSelector((state) => state.auth.userInfo);
  const { authenticated } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchChallenge = async () => {
      try {
        const data = await ChallengesService.getChallengeById(id);
        setChallenge(data);
      } catch (error) {
        console.error('Failed to fetch challenge', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  const handleUpload = async () => {
    if (!file || !id || !userId) return;
    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('media', file);
    formData.append('user_id', userId);
    formData.append('challenge_id', id);
    formData.append('media_type', file.type.startsWith('video') ? 'video' : 'image');

    try {
      await ApiService.fetchData({
        url: '/proofs',
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('success');
      setFile(null);
      // Refresh challenge data
      const updatedData = await ChallengesService.getChallengeById(id);
      setChallenge(updatedData);
    } catch (error) {
      console.error('Upload failed', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingOverlay visible={true} />;
  if (!challenge) return <Text>Challenge not found</Text>;

  const theme = getGameTheme(challenge.game_name);

  return (
    <Box style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <Container size="xl" pt="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft />}
          onClick={() => navigate('/challenges')}
          mb="md"
        >
          Back to Challenges
        </Button>
      </Container>

      {/* Hero Section */}
      <Container size="xl">
        <ChallengeHero
          bannerUrl={challenge.banner_url}
          gameName={challenge.game_name}
          challengeName={challenge.challenge_name}
          type={challenge.type}
          participantCount={challenge.participant_count || 0}
        />
      </Container>

      {/* Main Content */}
      <Container size="xl">
        <Grid gutter="xl">
          {/* Left Column - Challenge Info */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="xl">
              {/* Description Card */}
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                <Title order={3} mb="md" c={theme.primary}>
                  About This Challenge
                </Title>
                <Text size="lg" style={{ lineHeight: 1.8 }}>
                  {challenge.description}
                </Text>

                <Divider my="xl" />

                <Group>
                  <IconCoin size={24} color={theme.primary} />
                  <div>
                    <Text size="sm" c="dimmed">
                      Reward
                    </Text>
                    <Text size="xl" fw={700} c={theme.primary}>
                      {challenge.reward}
                    </Text>
                  </div>
                </Group>
              </Paper>

              {/* Proof Upload Card */}
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                <Group justify="space-between" mb="md">
                  <Title order={4}>Submit Proof</Title>
                  {challenge.user_participated && (
                    <Badge
                      color={challenge.user_proof_status === 'APPROVED' ? 'green' : 'yellow'}
                      size="lg"
                      leftSection={challenge.user_proof_status === 'APPROVED' ? <IconCheck size={16} /> : undefined}
                    >
                      {challenge.user_proof_status || 'PENDING'}
                    </Badge>
                  )}
                </Group>

                {uploadStatus === 'success' && (
                  <Notification
                    icon={<IconCheck size="1.1rem" />}
                    color="teal"
                    title="Success"
                    mb="md"
                    onClose={() => setUploadStatus(null)}
                  >
                    Proof uploaded successfully! Awaiting approval.
                  </Notification>
                )}
                {uploadStatus === 'error' && (
                  <Notification
                    icon={<IconX size="1.1rem" />}
                    color="red"
                    title="Error"
                    mb="md"
                    onClose={() => setUploadStatus(null)}
                  >
                    Failed to upload proof. Please try again.
                  </Notification>
                )}

                {authenticated ? (
                  <Stack gap="md">
                    <FileInput
                      placeholder="Upload image or video proof"
                      label="Proof Media"
                      description="Upload a screenshot or video showing your completion"
                      value={file}
                      onChange={setFile}
                      accept="image/*,video/*"
                      leftSection={<IconUpload size={16} />}
                    />
                    <Button
                      onClick={handleUpload}
                      loading={uploading}
                      disabled={!file || !userId}
                      fullWidth
                      size="lg"
                      style={{
                        background: theme.gradient,
                        boxShadow: `0 4px 20px ${theme.glow}`,
                      }}
                    >
                      Submit Proof
                    </Button>
                  </Stack>
                ) : (
                  <Stack align="center" py="md">
                    <Text c="dimmed" ta="center">
                      You need to be logged in to submit proof and participate in this challenge.
                    </Text>
                    <Button
                      onClick={() => navigate('/sign-in', { state: { message: 'You need to be logged in to submit proof and participate in this challenge.' } })}
                      fullWidth
                      size="lg"
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                    >
                      Sign in to Participate
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Right Column - Leaderboard */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper
              shadow="md"
              p="xl"
              radius="md"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                border: `1px solid ${theme.primary}20`,
                position: 'sticky',
                top: '2rem',
              }}
            >
              <Title order={3} mb="xl" c={theme.primary}>
                Leaderboard
              </Title>
              <EnhancedLeaderboard challengeId={id!} currentUserId={userId} />
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default ChallengeDetail;
