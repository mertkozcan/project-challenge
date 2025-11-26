import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ChallengesService } from '@/services/challenges/challenges.service';

interface Game {
  id: number;
  name: string;
}

import { useAppSelector } from '@/store';

const CreateChallenge: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = useAppSelector((state) => state.auth.userInfo.userId);

  const form = useForm({
    initialValues: {
      game_name: '',
      challenge_name: '',
      description: '',
      type: 'permanent',
    },
    validate: {
      game_name: (value) => (!value ? 'Game is required' : null),
      challenge_name: (value) => (!value ? 'Challenge name is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
  });

  useEffect(() => {
    fetchGames();
    if (id) {
      fetchChallenge();
    }
  }, [id]);

  const fetchGames = async () => {
    try {
      const res = await ApiService.fetchData<void, Game[]>({
        url: '/games',
        method: 'GET',
        data: undefined,
      });
      setGames(res.data);
    } catch (error) {
      console.error('Failed to fetch games', error);
    }
  };

  const fetchChallenge = async () => {
    if (!id) return;
    try {
      const challenge = await ChallengesService.getChallengeById(id);
      form.setValues({
        game_name: challenge.game_name,
        challenge_name: challenge.challenge_name,
        description: challenge.description,
        type: challenge.type || 'permanent',
      });
    } catch (error) {
      console.error('Failed to fetch challenge', error);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (id) {
        await ChallengesService.updateChallenge(id, values as any);
      } else {
        await ApiService.fetchData({
          url: '/challenges',
          method: 'POST',
          data: {
            ...values,
            reward: 'None', // Community challenges have no reward
            created_by: userId,
          },
        });
      }
      navigate('/challenges');
    } catch (error) {
      console.error('Failed to save challenge', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="xl">{id ? 'Edit Challenge' : 'Create Community Challenge'}</Title>

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

          {/* Type is always permanent for community challenges */}

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => navigate('/challenges')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {id ? 'Update Challenge' : 'Create Challenge'}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateChallenge;
