import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  LoadingOverlay,
  Grid,
  Box,
  Stack,
  Divider,
  Group,
  Badge,
} from '@mantine/core';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { RunSessionService, RunSession } from '@/services/runSession.service';
import { Challenge } from '@/@types/challenge';
import { IconArrowLeft, IconTrophy, IconCoin, IconCheck } from '@tabler/icons-react';
import ChallengeHero from './ChallengeHero';
import EnhancedLeaderboard from './EnhancedLeaderboard';
import ProofSubmission from './ProofSubmission';
import { getGameTheme } from '@/utils/gameThemes';
import { notifications } from '@mantine/notifications';
import { useAppSelector } from '@/store';
import useAuth from '@/utils/hooks/useAuth';

interface ChallengeData extends Challenge {
  banner_url?: string;
  participant_count?: number;
  user_participated?: boolean;
  user_proof_status?: string;
}

const ChallengeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAppSelector((state) => state.auth.userInfo);
  const { authenticated } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [activeSession, setActiveSession] = useState<RunSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChallenge, setStartingChallenge] = useState(false);

  const fetchChallengeData = async () => {
    if (!id) return;
    try {
      const data = await ChallengesService.getChallengeById(id);
      setChallenge(data);
    } catch (error) {
      console.error('Failed to fetch challenge', error);
    }
  };

  const fetchActiveSession = async () => {
    if (!userId) return;
    try {
      const session = await RunSessionService.getActiveSession(userId);
      if (session && session.challenge_id === parseInt(id!)) {
        setActiveSession(session);
      }
    } catch (error) {
      console.error('Failed to fetch active session', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchChallengeData(), fetchActiveSession()]);
      setLoading(false);
    };
    init();
  }, [id, userId]);

  const handleStartChallenge = async () => {
    if (!id || !userId || !challenge) return;

    setStartingChallenge(true);
    try {
      // Check if user already has an active session for this challenge
      const existingSession = await RunSessionService.getActiveSession(userId);
      
      if (existingSession && existingSession.challenge_id === parseInt(id)) {
        setActiveSession(existingSession);
        return;
      }

      // Start a new run session
      const session = await RunSessionService.startSession({
        userId,
        challengeId: parseInt(id),
        gameName: challenge.game_name,
      });

      notifications.show({
        title: 'Challenge Started!',
        message: `Your character name is: ${session.display_username}. Set this in-game before completing the challenge.`,
        color: 'green',
      });

      setActiveSession(session);
    } catch (error: any) {
      console.error('Failed to start challenge:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to start challenge. Please try again.',
        color: 'red',
      });
    } finally {
      setStartingChallenge(false);
    }
  };

  const handleProofSuccess = () => {
    setActiveSession(null);
    fetchChallengeData(); // Refresh challenge data to update participation status
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

              {/* Start Challenge / Proof Submission Section */}
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                {activeSession ? (
                  <ProofSubmission session={activeSession} onSuccess={handleProofSuccess} />
                ) : (
                  <Stack gap="md">
                    <Title order={4} c={theme.primary}>Ready to Start?</Title>
                    
                    {challenge.user_participated && (
                      <Badge
                        color={challenge.user_proof_status === 'APPROVED' ? 'green' : 'yellow'}
                        size="lg"
                        leftSection={challenge.user_proof_status === 'APPROVED' ? <IconCheck size={16} /> : undefined}
                      >
                        {challenge.user_proof_status || 'PENDING'}
                      </Badge>
                    )}

                    <Text size="sm" c="dimmed">
                      Starting this challenge will:
                    </Text>
                    <Stack gap="xs">
                      <Text size="sm">✓ Generate a unique character name for you</Text>
                      <Text size="sm">✓ Track your progress</Text>
                      <Text size="sm">✓ Enable OCR verification for your proof</Text>
                      <Text size="sm">✓ Require video evidence of completion</Text>
                    </Stack>

                    {authenticated ? (
                      <Button
                        onClick={handleStartChallenge}
                        loading={startingChallenge}
                        fullWidth
                        size="lg"
                        leftSection={<IconTrophy size={20} />}
                        style={{
                          background: theme.gradient,
                          boxShadow: `0 4px 20px ${theme.glow}`,
                        }}
                      >
                        Start Challenge
                      </Button>
                    ) : (
                      <Stack align="center" py="md">
                        <Text c="dimmed" ta="center">
                          You need to be logged in to start this challenge.
                        </Text>
                        <Button
                          onClick={() => navigate('/sign-in', { state: { message: 'You need to be logged in to start challenges.' } })}
                          fullWidth
                          size="lg"
                          variant="gradient"
                          gradient={{ from: 'blue', to: 'cyan' }}
                        >
                          Sign in to Participate
                        </Button>
                      </Stack>
                    )}
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
