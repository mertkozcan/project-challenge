import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Paper, Button, FileInput, Group, LoadingOverlay, Badge, Notification } from '@mantine/core';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { Challenge } from '@/@types/challenge';
import { IconUpload, IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react';
import ApiService from '@/services/ApiService';
import { LeaderboardService } from '@/services/leaderboard/leaderboard.service';
import { Table } from '@mantine/core';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
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
    if (!file || !id) return;
    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('media', file);
    formData.append('user_id', '1'); // Hardcoded user ID
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
    } catch (error) {
      console.error('Upload failed', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingOverlay visible={true} />;
  if (!challenge) return <Text>Challenge not found</Text>;

  return (
    <Container size="md" py="xl">
      <Button variant="subtle" leftSection={<IconArrowLeft />} onClick={() => navigate('/challenges')} mb="md">
        Back to Challenges
      </Button>

      <Paper shadow="xs" p="xl" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>{challenge.challenge_name}</Title>
          <Badge color={challenge.type === 'daily' ? 'green' : challenge.type === 'weekly' ? 'blue' : 'gray'}>
            {challenge.type.toUpperCase()}
          </Badge>
        </Group>
        
        <Text c="dimmed" size="lg" mb="md">{challenge.game_name}</Text>
        <Text mb="lg">{challenge.description}</Text>
        
        <Text fw={700} c="yellow">Reward: {challenge.reward}</Text>

        <Paper withBorder p="md" mt="xl" bg="dark.8">
          <Title order={4} mb="md">Submit Proof</Title>
          
          {uploadStatus === 'success' && (
            <Notification icon={<IconCheck size="1.1rem" />} color="teal" title="Success" mb="md" onClose={() => setUploadStatus(null)}>
              Proof uploaded successfully!
            </Notification>
          )}
           {uploadStatus === 'error' && (
            <Notification icon={<IconX size="1.1rem" />} color="red" title="Error" mb="md" onClose={() => setUploadStatus(null)}>
              Failed to upload proof.
            </Notification>
          )}

          <Group align="flex-end">
            <FileInput
              placeholder="Upload image or video"
              label="Proof Media"
              value={file}
              onChange={setFile}
              accept="image/*,video/*"
              leftSection={<IconUpload size={14} />}
              style={{ flex: 1 }}
            />
            <Button onClick={handleUpload} loading={uploading} disabled={!file}>
              Submit
            </Button>
          </Group>
        </Paper>

        <Paper withBorder p="md" mt="xl">
            <Title order={4} mb="md">Leaderboard</Title>
            <ChallengeLeaderboard challengeId={id!} />
        </Paper>
      </Paper>
    </Container>
  );
};

const ChallengeLeaderboard: React.FC<{ challengeId: string }> = ({ challengeId }) => {
    const [rankings, setRankings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const data = await LeaderboardService.getChallengeRankings(challengeId);
                setRankings(data);
            } catch (error) {
                console.error('Failed to fetch rankings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [challengeId]);

    if (loading) return <Text>Loading rankings...</Text>;
    if (rankings.length === 0) return <Text c="dimmed">No completions yet. Be the first!</Text>;

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Rank</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Score</Table.Th>
                    <Table.Th>Date</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {rankings.map((entry, index) => (
                    <Table.Tr key={index}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>{entry.username}</Table.Td>
                        <Table.Td>{entry.score}</Table.Td>
                        <Table.Td>{new Date(entry.created_at).toLocaleDateString()}</Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default ChallengeDetail;
