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
} from '@mantine/core';
import { AdminService, type Game } from '@/services/admin/admin.service';
import { IconPlus, IconTrash, IconDeviceGamepad2 } from '@tabler/icons-react';
import { useForm } from '@mantine/form';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('games');
  const [games, setGames] = useState<Game[]>([]);
  const [modalOpened, setModalOpened] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      icon_url: '',
    },
  });

  useEffect(() => {
    if (activeTab === 'games') {
      fetchGames();
    }
  }, [activeTab]);

  const fetchGames = async () => {
    try {
      const data = await AdminService.getGames();
      setGames(data);
    } catch (error) {
      console.error('Failed to fetch games', error);
    }
  };

  const handleCreateGame = async (values: typeof form.values) => {
    try {
      await AdminService.createGame(values.name, values.description, values.icon_url);
      setModalOpened(false);
      form.reset();
      fetchGames();
    } catch (error) {
      console.error('Failed to create game', error);
    }
  };

  const handleDeleteGame = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await AdminService.deleteGame(id);
      fetchGames();
    } catch (error) {
      console.error('Failed to delete game', error);
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
          <Tabs.Tab value="challenges">Official Challenges</Tabs.Tab>
          <Tabs.Tab value="builds">Official Builds</Tabs.Tab>
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
          <Text c="dimmed">Official Challenges management coming soon...</Text>
        </Tabs.Panel>

        <Tabs.Panel value="builds" pt="md">
          <Text c="dimmed">Official Builds management coming soon...</Text>
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
    </Container>
  );
};

export default AdminPanel;
