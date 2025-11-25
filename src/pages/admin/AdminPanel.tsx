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
  SegmentedControl,
  ActionIcon,
  Card,
  SimpleGrid,
  Stack,
  Select,
} from '@mantine/core';
import { AdminService, type Game } from '@/services/admin/admin.service';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { BuildsService } from '@/services/builds/builds.service';
import ProofService, { type Proof } from '@/services/proof/proof.service';
import { Challenge } from '@/@types/challenge';
import { Build } from '@/@types/build';
import { IconPlus, IconTrash, IconDeviceGamepad2, IconFileCheck, IconCheck, IconX, IconTarget, IconSword, IconFilter } from '@tabler/icons-react';
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
  const [buildFilter, setBuildFilter] = useState('all'); // 'all', 'official', 'community'
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
  }, [activeTab, userId, buildFilter]);

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
      // Pass 'official' or 'community' if filter is set, otherwise undefined for all (if backend supports it)
      // If backend only supports 'official' or 'community', we might need to adjust logic.
      // Assuming backend getAllBuilds handles optional contentType.
      const contentType = buildFilter === 'all' ? undefined : buildFilter;
      const data = await BuildsService.getBuilds(contentType);
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

  const handleDeleteBuild = async (id: number) => {
    if (!confirm('Are you sure you want to delete this build? This action cannot be undone.')) return;
    try {
      await BuildsService.deleteBuild(id);
      fetchBuilds();
    } catch (error) {
      console.error('Failed to delete build', error);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Admin Dashboard</Title>
        <Badge size="lg" variant="dot" color="green">System Online</Badge>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="games" leftSection={<IconDeviceGamepad2 size={18} />}>
            Games
          </Tabs.Tab>
          <Tabs.Tab value="challenges" leftSection={<IconTarget size={18} />}>
            Challenges
          </Tabs.Tab>
          <Tabs.Tab value="builds" leftSection={<IconSword size={18} />}>
            Builds
          </Tabs.Tab>
          <Tabs.Tab value="proofs" leftSection={<IconFileCheck size={18} />}>
            Proofs
            {proofs.length > 0 && (
              <Badge size="xs" circle color="red" style={{ marginLeft: 8 }}>
                {proofs.length}
              </Badge>
            )}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="games">
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
              <Title order={4}>Games Management</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={() => setModalOpened(true)}>
                Add Game
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {games.map((game) => (
                <Card key={game.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={700} size="lg">{game.name}</Text>
                    <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteGame(game.id)}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                    {game.description}
                  </Text>
                  {game.icon_url && (
                    <Badge variant="outline" color="gray">Has Icon</Badge>
                  )}
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="challenges">
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
              <Title order={4}>Official Challenges</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={() => setChallengeModalOpened(true)}>
                Add Challenge
              </Button>
            </Group>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Game</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Reward</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {challenges.map((challenge) => (
                  <Table.Tr key={challenge.id}>
                    <Table.Td fw={500}>{challenge.challenge_name}</Table.Td>
                    <Table.Td>{challenge.game_name}</Table.Td>
                    <Table.Td>
                      <Badge color={challenge.type === 'permanent' ? 'blue' : 'green'} variant="light">
                        {challenge.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{challenge.reward}</Table.Td>
                    <Table.Td>
                      <ActionIcon color="red" variant="subtle">
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {challenges.length === 0 && (
                   <Table.Tr>
                    <Table.Td colSpan={5} align="center">
                      <Text c="dimmed">No official challenges found.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="builds">
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
              <Group>
                <Title order={4}>Builds Management</Title>
                <SegmentedControl
                  value={buildFilter}
                  onChange={setBuildFilter}
                  data={[
                    { label: 'All', value: 'all' },
                    { label: 'Official', value: 'official' },
                    { label: 'Community', value: 'community' },
                  ]}
                />
              </Group>
              <Button leftSection={<IconPlus size={16} />} onClick={() => setBuildModalOpened(true)}>
                Create Official Build
              </Button>
            </Group>
            
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Creator</Table.Th>
                  <Table.Th>Game</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {builds.map((build) => (
                  <Table.Tr key={build.id}>
                    <Table.Td fw={500}>{build.build_name}</Table.Td>
                    <Table.Td>{build.username || 'Unknown'}</Table.Td>
                    <Table.Td>{build.game_name}</Table.Td>
                    <Table.Td>
                      <Badge 
                        color={build.is_official ? 'yellow' : 'blue'} 
                        variant={build.is_official ? 'filled' : 'light'}
                      >
                        {build.is_official ? 'Official' : 'Community'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{new Date(build.created_at).toLocaleDateString()}</Table.Td>
                    <Table.Td>
                      <ActionIcon 
                        color="red" 
                        variant="subtle" 
                        onClick={() => handleDeleteBuild(build.id!)}
                        title="Delete Build"
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {builds.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6} align="center">
                      <Text c="dimmed">No builds found matching filter.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="proofs">
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
              <Title order={4}>Pending Proofs</Title>
              <Badge size="lg" color="orange">{proofs.length} Pending</Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              {proofs.map((proof) => (
                <Card key={proof.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <Text fw={700}>{proof.username}</Text>
                      <Text size="sm" c="dimmed">submitted for</Text>
                      <Text fw={600} c="blue">{proof.challenge_name}</Text>
                    </Group>
                    <Badge>{proof.game_name}</Badge>
                  </Group>
                  
                  <Paper p="xs" bg="dark.8" mb="md" radius="sm">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Media Type: {proof.media_type}</Text>
                      <a href={proof.media_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#4dabf7' }}>
                        View Proof Media
                      </a>
                    </Group>
                  </Paper>

                  <Group grow>
                    <Button
                      color="green"
                      leftSection={<IconCheck size={16} />}
                      onClick={() => handleApproveProof(proof.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      leftSection={<IconX size={16} />}
                      onClick={() => handleRejectProof(proof.id)}
                    >
                      Reject
                    </Button>
                  </Group>
                </Card>
              ))}
              {proofs.length === 0 && (
                <Text c="dimmed" ta="center" py="xl" style={{ gridColumn: '1 / -1' }}>
                  No pending proofs to review. Good job!
                </Text>
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Modals remain mostly the same but could be styled better if needed */}
      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Add New Game" centered>
        <form onSubmit={form.onSubmit(handleCreateGame)}>
          <Stack gap="md">
            <TextInput
              label="Game Name"
              placeholder="e.g., Elden Ring"
              required
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Game description..."
              {...form.getInputProps('description')}
            />
            <TextInput
              label="Icon URL"
              placeholder="https://..."
              {...form.getInputProps('icon_url')}
            />
            <Button type="submit" fullWidth mt="md">
              Create Game
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={challengeModalOpened} onClose={() => setChallengeModalOpened(false)} title="Add Official Challenge" centered>
        <form onSubmit={challengeForm.onSubmit(handleCreateChallenge)}>
          <Stack gap="md">
            <TextInput
              label="Game Name"
              placeholder="e.g., Elden Ring"
              required
              {...challengeForm.getInputProps('game_name')}
            />
            <TextInput
              label="Challenge Name"
              placeholder="e.g., Boss Rush"
              required
              {...challengeForm.getInputProps('challenge_name')}
            />
            <Textarea
              label="Description"
              placeholder="Challenge description..."
              required
              {...challengeForm.getInputProps('description')}
            />
            <TextInput
              label="Reward"
              placeholder="e.g., 500 Points"
              required
              {...challengeForm.getInputProps('reward')}
            />
            <Select
              label="Type"
              data={['permanent', 'daily', 'weekly']}
              required
              {...challengeForm.getInputProps('type')}
            />
            <TextInput
              label="End Date"
              placeholder="YYYY-MM-DD (Optional)"
              {...challengeForm.getInputProps('end_date')}
            />
            <Button type="submit" fullWidth mt="md">
              Create Challenge
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={buildModalOpened} onClose={() => setBuildModalOpened(false)} title="Add Official Build" centered>
        <form onSubmit={buildForm.onSubmit(handleCreateBuild)}>
          <Stack gap="md">
            <TextInput
              label="Game Name"
              placeholder="e.g., Elden Ring"
              required
              {...buildForm.getInputProps('game_name')}
            />
            <TextInput
              label="Build Name"
              placeholder="e.g., Bleed Build"
              required
              {...buildForm.getInputProps('build_name')}
            />
            <Textarea
              label="Description"
              placeholder="Build description..."
              required
              {...buildForm.getInputProps('description')}
            />
            <Textarea
              label="Items JSON"
              placeholder='{"weapon": "Rivers of Blood"}'
              required
              {...buildForm.getInputProps('items_json')}
              minRows={4}
            />
            <Button type="submit" fullWidth mt="md">
              Create Build
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default AdminPanel;
