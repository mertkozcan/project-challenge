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
import { useTranslation } from 'react-i18next';

interface Game {
  id: number;
  name: string;
}

import { useAppSelector } from '@/store';

const CreateChallenge: React.FC = () => {
  const { t } = useTranslation();
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
      game_name: (value) => (!value ? t('challenges.gameRequired') : null),
      challenge_name: (value) => (!value ? t('challenges.nameRequired') : null),
      description: (value) => (!value ? t('challenges.descRequired') : null),
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
            reward_xp: 0, // Community challenges have 0 XP by default
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
      <Title order={2} mb="xl">{id ? t('challenges.editChallenge') : t('challenges.createCommunityTitle')}</Title>

      <Paper shadow="sm" p="xl" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label={t('challenges.game')}
            placeholder={t('common.search')}
            data={games.map((g) => ({ value: g.name, label: g.name }))}
            required
            {...form.getInputProps('game_name')}
            mb="md"
          />

          <TextInput
            label={t('challenges.challengeName')}
            placeholder={t('challenges.challengeNamePlaceholder')}
            required
            {...form.getInputProps('challenge_name')}
            mb="md"
          />

          <Textarea
            label={t('challenges.description')}
            placeholder={t('challenges.descriptionPlaceholder')}
            required
            minRows={4}
            {...form.getInputProps('description')}
            mb="md"
          />

          {/* Type is always permanent for community challenges */}

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => navigate('/challenges')}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading}>
              {id ? t('challenges.editChallenge') : t('challenges.createChallenge')}
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateChallenge;
