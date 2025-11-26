import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Image,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { AdminService, type Game } from '@/services/admin/admin.service';
import { ChallengesService } from '@/services/challenges/challenges.service';
import { BuildsService } from '@/services/builds/builds.service';
import ProofService, { type Proof } from '@/services/proof/proof.service';
import { BingoService } from '@/services/bingo/bingo.service';
import { Challenge } from '@/@types/challenge';
import { Build } from '@/@types/build';
import { IconPlus, IconTrash, IconDeviceGamepad2, IconFileCheck, IconCheck, IconX, IconTarget, IconSword, IconGridDots, IconEdit } from '@tabler/icons-react';
import { useAppSelector } from '@/store';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  
  // Bingo Tasks State
  const [bingoTasks, setBingoTasks] = useState<any[]>([]);
  const [bingoBoards, setBingoBoards] = useState<any[]>([]);
  const [taskGameFilter, setTaskGameFilter] = useState<string>('Elden Ring');
  const navigate = useNavigate();
  
  // Modals
  const [challengeModalOpened, setChallengeModalOpened] = useState(false);
  const [buildModalOpened, setBuildModalOpened] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [newTaskOpened, { open: openNewTask, close: closeNewTask }] = useDisclosure(false);

  // Editing State
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);

  const [buildFilter, setBuildFilter] = useState('all');
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

  const taskForm = useForm({
    initialValues: {
        game_name: 'Elden Ring',
        task: '',
        difficulty: 'Normal',
        type: 'Standard'
    },
    validate: {
        task: (value) => (value.length < 3 ? 'Task must be at least 3 characters' : null),
    }
  });

  useEffect(() => {
    if (!userId) return;
    if (activeTab === 'games') fetchGames();
    else if (activeTab === 'challenges') fetchChallenges();
    else if (activeTab === 'builds') fetchBuilds();
    else if (activeTab === 'proofs') fetchProofs();
    else if (activeTab === 'bingo-tasks') fetchBingoTasks();
    else if (activeTab === 'bingo-challenges') fetchBingoBoards();
  }, [activeTab, userId, buildFilter, taskGameFilter]);

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
      const contentType = buildFilter === 'all' ? undefined : buildFilter;
      const data = await BuildsService.getBuilds(contentType);
      setBuilds(data);
    } catch (error) {
      console.error('Failed to fetch builds', error);
    }
  };

  const fetchBingoTasks = async () => {
    try {
        const tasks = await BingoService.getTasks(taskGameFilter);
        setBingoTasks(tasks);
    } catch (error) {
        console.error('Failed to fetch bingo tasks', error);
    }
  };

  const fetchBingoBoards = async () => {
    try {
        const boards = await BingoService.getBoards();
        setBingoBoards(boards);
    } catch (error) {
        console.error('Failed to fetch bingo boards', error);
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
      if (editingChallenge) {
        await ChallengesService.updateChallenge(editingChallenge.id.toString(), values as any);
        notifications.show({ title: 'Success', message: 'Challenge updated successfully', color: 'green' });
      } else {
        await AdminService.createOfficialChallenge(values, userId);
        notifications.show({ title: 'Success', message: 'Challenge created successfully', color: 'green' });
      }
      setChallengeModalOpened(false);
      setEditingChallenge(null);
      challengeForm.reset();
      fetchChallenges();
    } catch (error) {
      console.error('Failed to save challenge', error);
      notifications.show({ title: 'Error', message: 'Failed to save challenge', color: 'red' });
    }
  };

  const openChallengeModal = (challenge?: Challenge) => {
    if (challenge) {
      setEditingChallenge(challenge);
      challengeForm.setValues({
        game_name: challenge.game_name,
        challenge_name: challenge.challenge_name,
        description: challenge.description,
        reward: challenge.reward,
        type: challenge.type,
        end_date: challenge.end_date ? new Date(challenge.end_date).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingChallenge(null);
      challengeForm.reset();
    }
    setChallengeModalOpened(true);
  };

  const handleCreateBuild = async (values: typeof buildForm.values) => {
    if (!userId) return;
    try {
      const payload = {
        ...values,
        items_json: JSON.parse(values.items_json),
      };
      
      if (editingBuild) {
        await BuildsService.updateBuild(editingBuild.id!.toString(), payload);
        notifications.show({ title: 'Success', message: 'Build updated successfully', color: 'green' });
      } else {
        await AdminService.createOfficialBuild(payload, userId);
        notifications.show({ title: 'Success', message: 'Build created successfully', color: 'green' });
      }
      setBuildModalOpened(false);
      setEditingBuild(null);
      buildForm.reset();
      fetchBuilds();
    } catch (error) {
      console.error('Failed to save build', error);
      notifications.show({ title: 'Error', message: 'Failed to save build', color: 'red' });
    }
  };

  const openBuildModal = (build?: Build) => {
    if (build) {
      setEditingBuild(build);
      buildForm.setValues({
        game_name: build.game_name,
        build_name: build.build_name,
        description: build.description,
        items_json: JSON.stringify(build.items_json, null, 2),
      });
    } else {
      setEditingBuild(null);
      buildForm.reset();
    }
    setBuildModalOpened(true);
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

  const handleAddTask = async (values: typeof taskForm.values) => {
    try {
        await BingoService.createTask(values);
        notifications.show({ title: 'Success', message: 'Task added successfully', color: 'green' });
        closeNewTask();
        taskForm.reset();
        fetchBingoTasks();
    } catch (error) {
        notifications.show({ title: 'Error', message: 'Failed to add task', color: 'red' });
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
        await BingoService.deleteTask(id);
        notifications.show({ title: 'Success', message: 'Task deleted successfully', color: 'green' });
        fetchBingoTasks();
    } catch (error) {
        notifications.show({ title: 'Error', message: 'Failed to delete task', color: 'red' });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Admin Control Panel</Title>
          <Text c="dimmed">Manage system resources and content</Text>
        </div>
        <Badge size="lg" variant="dot" color="green">System Online</Badge>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
        <Tabs.List mb="lg">
          <Tabs.Tab value="games" leftSection={<IconDeviceGamepad2 size={18} />}>Games</Tabs.Tab>
          <Tabs.Tab value="challenges" leftSection={<IconTarget size={18} />}>Challenges</Tabs.Tab>
          <Tabs.Tab value="builds" leftSection={<IconSword size={18} />}>Builds</Tabs.Tab>
          <Tabs.Tab value="proofs" leftSection={<IconFileCheck size={18} />} rightSection={
            proofs.length > 0 && <Badge size="xs" circle color="red">{proofs.length}</Badge>
          }>Proofs</Tabs.Tab>
          <Tabs.Tab value="bingo-challenges" leftSection={<IconTarget size={18} />}>Bingo Challenges</Tabs.Tab>
          <Tabs.Tab value="bingo-tasks" leftSection={<IconGridDots size={18} />}>Bingo Tasks</Tabs.Tab>
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
                  <Card.Section>
                     <Image src={game.icon_url || 'https://placehold.co/600x400'} height={160} alt={game.name} fallbackSrc="https://placehold.co/600x400" />
                  </Card.Section>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={700} size="lg">{game.name}</Text>
                    <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteGame(game.id)}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                    {game.description}
                  </Text>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="challenges">
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
              <Title order={4}>Official Challenges</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={() => openChallengeModal()}>
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
                      <Group gap="xs">
                        <ActionIcon color="blue" variant="subtle" onClick={() => openChallengeModal(challenge)}>
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon color="red" variant="subtle">
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
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
              <Button leftSection={<IconPlus size={16} />} onClick={() => openBuildModal()}>
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
                      <Group gap="xs">
                        <ActionIcon 
                          color="blue" 
                          variant="subtle" 
                          onClick={() => openBuildModal(build)}
                          title="Edit Build"
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                        <ActionIcon 
                          color="red" 
                          variant="subtle" 
                          onClick={() => handleDeleteBuild(build.id!)}
                          title="Delete Build"
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
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
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Media Type: {proof.media_type}</Text>
                        {proof.media_url && (
                          <a href={proof.media_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#4dabf7' }}>
                            View Image
                          </a>
                        )}
                      </Group>
                      {proof.media_url && (
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">Video Evidence:</Text>
                          <a href={proof.media_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#4dabf7' }}>
                            Watch Video
                          </a>
                        </Group>
                      )}
                    </Stack>
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

        <Tabs.Panel value="bingo-challenges">
          <Paper p="xl" radius="md" withBorder>
            <Group justify="space-between" mb="xl">
              <Title order={4}>Bingo Challenges Management</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/bingo/create?source=admin')}>
                Create Bingo Challenge
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {bingoBoards.map((board) => (
                <Card key={board.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={700} size="lg">{board.title}</Text>
                    <Badge color={board.created_by === 'admin' ? 'yellow' : 'blue'}>
                        {board.created_by === 'admin' ? 'Official' : 'Community'}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" mb="md">
                    {board.game_name} • {board.size}x{board.size} • {board.type}
                  </Text>
                  <Text size="sm" mb="md" lineClamp={2}>
                    {board.description}
                  </Text>
                  <Group grow>
                    <Button variant="light" onClick={() => navigate(`/bingo/${board.id}`)}>
                      View Board
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/bingo/edit/${board.id}?source=admin`)}>
                      Edit
                    </Button>
                  </Group>
                </Card>
              ))}
              {bingoBoards.length === 0 && (
                <Text c="dimmed" ta="center" style={{ gridColumn: '1 / -1' }}>No bingo challenges found.</Text>
              )}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="bingo-tasks">
            <Stack gap="md">
                <Group justify="space-between">
                    <Select 
                        data={games.map(g => g.name)}
                        value={taskGameFilter}
                        onChange={(val) => setTaskGameFilter(val || 'Elden Ring')}
                        allowDeselect={false}
                        searchable
                    />
                    <Button leftSection={<IconPlus size={16} />} onClick={openNewTask}>Add Task</Button>
                </Group>

            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Task Description</Table.Th>
                                <Table.Th w={120}>Difficulty</Table.Th>
                                <Table.Th w={120}>Type</Table.Th>
                                <Table.Th w={80}>Action</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {bingoTasks.map((task) => (
                                <Table.Tr key={task.id}>
                                    <Table.Td>{task.task}</Table.Td>
                                    <Table.Td><Badge variant="light" color={task.difficulty === 'Hard' ? 'red' : 'blue'}>{task.difficulty}</Badge></Table.Td>
                                    <Table.Td>{task.type}</Table.Td>
                                    <Table.Td>
                                        <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteTask(task.id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                            {bingoTasks.length === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={4} ta="center" py="xl" c="dimmed">No tasks found for this game.</Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Paper>
            </Stack>
        </Tabs.Panel>
      </Tabs>

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

      <Modal opened={challengeModalOpened} onClose={() => setChallengeModalOpened(false)} title={editingChallenge ? "Edit Challenge" : "Add Official Challenge"} centered>
        <form onSubmit={challengeForm.onSubmit(handleCreateChallenge)}>
          <Stack gap="md">
            <Select
              label="Game Name"
              placeholder="Select Game"
              data={games.map(g => g.name)}
              required
              searchable
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
              {editingChallenge ? "Update Challenge" : "Create Challenge"}
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={buildModalOpened} onClose={() => setBuildModalOpened(false)} title={editingBuild ? "Edit Build" : "Add Official Build"} centered>
        <form onSubmit={buildForm.onSubmit(handleCreateBuild)}>
          <Stack gap="md">
            <Select
              label="Game Name"
              placeholder="Select Game"
              data={games.map(g => g.name)}
              required
              searchable
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
              {editingBuild ? "Update Build" : "Create Build"}
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={newTaskOpened} onClose={closeNewTask} title="Add Bingo Task" centered>
        <form onSubmit={taskForm.onSubmit(handleAddTask)}>
            <Stack>
                <Select 
                    label="Game" 
                    data={games.map(g => g.name)} 
                    required 
                    searchable
                    {...taskForm.getInputProps('game_name')} 
                />
                <Textarea 
                    label="Task Description" 
                    placeholder="e.g. Defeat Margit only using daggers" 
                    required 
                    minRows={3}
                    {...taskForm.getInputProps('task')} 
                />
                <Group grow>
                    <Select 
                        label="Difficulty" 
                        data={['Easy', 'Normal', 'Hard', 'Expert']} 
                        required 
                        {...taskForm.getInputProps('difficulty')} 
                    />
                    <Select 
                        label="Type" 
                        data={['Standard', 'Boss', 'Item', 'Area']} 
                        required 
                        {...taskForm.getInputProps('type')} 
                    />
                </Group>
                <Button type="submit" fullWidth mt="md">
                    Add Task
                </Button>
            </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default AdminPanel;
