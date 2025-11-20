import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import ApiService from '@/services/ApiService';

interface Game {
  id: number;
  name: string;
}

const CreateChallenge: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      game_name: '',
      challenge_name: '',
      description: '',
      reward: '',
      type: 'permanent',
    },
    validate: {
      game_name: (value) => (!value ? 'Game is required' : null),
      challenge_name: (value) => (!value ? 'Challenge name is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
      reward: (value) => (!value ? 'Reward is required' : null),
    },
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await ApiService.fetchData<void, Game[]>({
        url: '/games',
        method: 'GET',
      });
      setGames(res.data);
    } catch (error) {
      console.error('Failed to fetch games', error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await ApiService.fetchData({
        url: '/challenges',
        method: 'POST',
        data: {
          ...values,
          created_by: 1, // Hardcoded user ID
        },
      });
      navigate('/challenges');
    } catch (error) {
      console.error('Failed to create challenge', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="xl">Create Community Challenge</Title>

      <Paper shadow="sm" p="xl" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Game"
            placeholder="Select a game"
            data={games.map((g) => ({ value: g.name, label: g.name }))}
            required
            {...form.getInputProps('game_name')}
            mb="md"
          />

          <TextInput
            label="Challenge Name"
            placeholder="e.g., Defeat Malenia without taking damage"
            required
            {...form.getInputProps('challenge_name')}
            mb="md"
          />

          <Textarea
            label="Description"
            placeholder="Describe the challenge..."
            required
            minRows={4}
            {...form.getInputProps('description')}
            mb="md"
          />

          <TextInput
            label="Reward"
            placeholder="e.g., 100 Points"
            required
            {...form.getInputProps('reward')}
            mb="md"
          />

          <Select
            label="Type"
            data={[
              { value: 'permanent', label: 'Permanent' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
            ]}
            required
            {...form.getInputProps('type')}
            mb="xl"
          />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => navigate('/challenges')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Challenge
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateChallenge;
