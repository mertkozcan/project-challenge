import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Tabs,
  Table,
  Button,
  Modal,
  TextInput,
  Textarea,
  Group,
  Paper,
  Text,
  Badge,
} from '@mantine/core';
import { AdminService, type Game } from '@/services/admin/admin.service';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { BuildsService } from '@/services/builds/builds.service';
import ProofService, { type Proof } from '@/services/proof/proof.service';
import { Challenge } from '@/@types/challenge';
import { Build } from '@/@types/build';
import { IconPlus, IconTrash, IconDeviceGamepad2, IconFileCheck, IconCheck, IconX, IconTarget, IconSword } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useAppSelector } from '@/store';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [challengeModalOpened, setChallengeModalOpened] = useState(false);
  const [buildModalOpened, setBuildModalOpened] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const userId = useAppSelector((state) => state.auth.userInfo.userId);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      icon_url: '',
    },
  });

  const challengeForm = useForm({
    initialValues: {
      game_name: '',
      challenge_name: '',
      description: '',
      reward: '',
      type: 'permanent',
      end_date: '',
    },
  });

  const buildForm = useForm({
    initialValues: {
      game_name: '',
      build_name: '',
      description: '',
      items_json: '{}',
    },
  });

  useEffect(() => {
    if (activeTab === 'games' && userId) {
      fetchGames();
    } else if (activeTab === 'challenges') {
      fetchChallenges();
    } else if (activeTab === 'builds') {
      fetchBuilds();
    } else if (activeTab === 'proofs') {
      fetchProofs();
    }
  }, [activeTab, userId]);

  const fetchGames = async () => {
    if (!userId) return;
    try {
      const data = await AdminService.getGames(userId);
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games', error);
    }
  };

  const fetchProofs = async () => {
    try {
      const data = await ProofService.getPendingProofs();
      setProofs(data);
    } catch (error) {
      console.error('Failed to fetch proofs', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const data = await ChallengesService.getChallenges(undefined, 'official');
      setChallenges(data);
    } catch (error) {
      console.error('Failed to fetch challenges', error);
    }
  };

  const fetchBuilds = async () => {
    try {
      const data = await BuildsService.getBuilds('official');
      setBuilds(data);
    } catch (error) {
      console.error('Failed to fetch builds', error);
    }
  };

  const handleCreateGame = async (values: typeof form.values) => {
    if (!userId) return;
    try {
      await AdminService.createGame(values.name, values.description, values.icon_url, userId);
      setModalOpened(false);
      form.reset();
      fetchGames();
    } catch (error) {
      console.error('Failed to create game', error);
    }
  };

  const handleDeleteGame = async (id: number) => {
    if (!userId) return;
    if (!confirm('Are you sure?')) return;
    try {
      await AdminService.deleteGame(id, userId);
      fetchGames();
    } catch (error) {
      console.error('Failed to delete game', error);
    }
  };

  const handleApproveProof = async (proofId: number) => {
    try {
      await ProofService.approveProof(proofId, 100);
      fetchProofs();
    } catch (error) {
      console.error('Failed to approve proof', error);
    }
  };

  const handleRejectProof = async (proofId: number) => {
    if (!confirm('Are you sure you want to reject this proof?')) return;
    try {
      await ProofService.rejectProof(proofId);
      fetchProofs();
    } catch (error) {
      console.error('Failed to reject proof', error);
    }
  };

  const handleCreateChallenge = async (values: typeof challengeForm.values) => {
    if (!userId) return;
    try {
      await AdminService.createOfficialChallenge(values, userId);
      setChallengeModalOpened(false);
      challengeForm.reset();
      fetchChallenges();
    } catch (error) {
      console.error('Failed to create challenge', error);
    }
  };

  const handleCreateBuild = async (values: typeof buildForm.values) => {
    if (!userId) return;
    try {
      const payload = {
        ...values,
        items_json: JSON.parse(values.items_json),
      };
      await AdminService.createOfficialBuild(payload, userId);
      setBuildModalOpened(false);
      buildForm.reset();
      fetchBuilds();
    } catch (error) {
      console.error('Failed to create build', error);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">Admin Panel</Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="games" leftSection={<IconDeviceGamepad2 size={16} />}>
            Games
          </Tabs.Tab>
          <Tabs.Tab value="challenges" leftSection={<IconTarget size={16} />}>
            Official Challenges
          </Tabs.Tab>
          <Tabs.Tab value="builds" leftSection={<IconSword size={16} />}>
            Official Builds
          </Tabs.Tab>
          <Tabs.Tab value="proofs" leftSection={<IconFileCheck size={16} />}>
            Pending Proofs
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="games" pt="md">
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={700}>Games Management</Text>
              <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpened(true)}>
                Add Game
              </Button>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {games.map((game) => (
                  <Table.Tr key={game.id}>
                    <Table.Td>{game.name}</Table.Td>
                    <Table.Td>{game.description}</Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        Delete
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="challenges" pt="md">
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={700}>Official Challenges Management</Text>
              <Button leftSection={<IconPlus size={16} />} onClick={() => setChallengeModalOpened(true)}>
                Add Challenge
              </Button>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Game</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Reward</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {challenges.length > 0 ? (
                  challenges.map((challenge) => (
                    <Table.Tr key={challenge.id}>
                      <Table.Td>{challenge.challenge_name}</Table.Td>
                      <Table.Td>{challenge.game_name}</Table.Td>
                      <Table.Td>
                        <Badge color={challenge.type === 'permanent' ? 'blue' : 'green'}>
                          {challenge.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{challenge.reward}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4} align="center">
                      <Text c="dimmed">No official challenges found.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="builds" pt="md">
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={700}>Official Builds Management</Text>
              <Button leftSection={<IconPlus size={16} />} onClick={() => setBuildModalOpened(true)}>
                Add Build
              </Button>
            </Group>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Game</Table.Th>
                  <Table.Th>Description</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {builds.length > 0 ? (
                  builds.map((build) => (
                    <Table.Tr key={build.id}>
                      <Table.Td>{build.build_name}</Table.Td>
                      <Table.Td>{build.game_name}</Table.Td>
                      <Table.Td>{build.description}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3} align="center">
                      <Text c="dimmed">No official builds found.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="proofs" pt="md">
          <Paper p="md" withBorder>
            <Text fw={700} mb="md">Pending Proof Submissions</Text>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Challenge</Table.Th>
                  <Table.Th>Game</Table.Th>
                  <Table.Th>Media</Table.Th>
                  <Table.Th>Submitted</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {proofs.length > 0 ? (
                  proofs.map((proof) => (
                    <Table.Tr key={proof.id}>
                      <Table.Td>{proof.username}</Table.Td>
                      <Table.Td>{proof.challenge_name}</Table.Td>
                      <Table.Td>{proof.game_name}</Table.Td>
                      <Table.Td>
                        <a href={proof.media_url} target="_blank" rel="noopener noreferrer">
                          View {proof.media_type}
                        </a>
                      </Table.Td>
                      <Table.Td>{new Date(proof.created_at).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Button
                            size="xs"
                            color="green"
                            leftSection={<IconCheck size={14} />}
                            onClick={() => handleApproveProof(proof.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            leftSection={<IconX size={14} />}
                            onClick={() => handleRejectProof(proof.id)}
                          >
                            Reject
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={6} align="center">
                      <Text c="dimmed">No pending proofs.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Add New Game">
        <form onSubmit={form.onSubmit(handleCreateGame)}>
          <TextInput
            label="Game Name"
            placeholder="e.g., Elden Ring"
            required
            {...form.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label="Description"
            placeholder="Game description..."
            {...form.getInputProps('description')}
            mb="md"
          />
          <TextInput
            label="Icon URL"
            placeholder="https://..."
            {...form.getInputProps('icon_url')}
            mb="md"
          />
          <Button type="submit" fullWidth>
            Create Game
          </Button>
        </form>
      </Modal>

      <Modal opened={challengeModalOpened} onClose={() => setChallengeModalOpened(false)} title="Add Official Challenge">
        <form onSubmit={challengeForm.onSubmit(handleCreateChallenge)}>
          <TextInput
            label="Game Name"
            placeholder="e.g., Elden Ring"
            required
            {...challengeForm.getInputProps('game_name')}
            mb="md"
          />
          <TextInput
            label="Challenge Name"
            placeholder="e.g., Boss Rush"
            required
            {...challengeForm.getInputProps('challenge_name')}
            mb="md"
          />
          <Textarea
            label="Description"
            placeholder="Challenge description..."
            required
            {...challengeForm.getInputProps('description')}
            mb="md"
          />
          <TextInput
            label="Reward"
            placeholder="e.g., 500 Points"
            required
            {...challengeForm.getInputProps('reward')}
            mb="md"
          />
          <TextInput
            label="Type"
            placeholder="permanent, daily, weekly"
            required
            {...challengeForm.getInputProps('type')}
            mb="md"
          />
          <TextInput
            label="End Date"
            placeholder="YYYY-MM-DD (Optional)"
            {...challengeForm.getInputProps('end_date')}
            mb="md"
          />
          <Button type="submit" fullWidth>
            Create Challenge
          </Button>
        </form>
      </Modal>

      <Modal opened={buildModalOpened} onClose={() => setBuildModalOpened(false)} title="Add Official Build">
        <form onSubmit={buildForm.onSubmit(handleCreateBuild)}>
          <TextInput
            label="Game Name"
            placeholder="e.g., Elden Ring"
            required
            {...buildForm.getInputProps('game_name')}
            mb="md"
          />
          <TextInput
            label="Build Name"
            placeholder="e.g., Bleed Build"
            required
            {...buildForm.getInputProps('build_name')}
            mb="md"
          />
          <Textarea
            label="Description"
            placeholder="Build description..."
            required
            {...buildForm.getInputProps('description')}
            mb="md"
          />
          <Textarea
            label="Items JSON"
            placeholder='{"weapon": "Rivers of Blood"}'
            required
            {...buildForm.getInputProps('items_json')}
            mb="md"
          />
          <Button type="submit" fullWidth>
            Create Build
          </Button>
        </form>
      </Modal>
    </Container>
  );
};

export default AdminPanel;
