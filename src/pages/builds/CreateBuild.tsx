import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Textarea, Button, Group, Notification, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BuildsService } from '@/services/builds/builds.service';
import { AdminService } from '@/services/admin/admin.service';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';
import { useAppSelector } from '@/store';
import BuildEditor, { BuildSlots } from '@/components/Builds/BuildEditor';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

const CreateBuild: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildSlots, setBuildSlots] = useState<BuildSlots>({
    stats: {
      level: 1,
      vigor: 10,
      mind: 10,
      endurance: 10,
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      faith: 10,
      arcane: 10,
    },
    spells: [],
    incantations: [],
    consumables: [],
  });

  const [games, setGames] = useState<any[]>([]);

  const form = useForm({
    initialValues: {
      game_name: 'Elden Ring',
      build_name: '',
      description: '',
      video_url: '',
    },

    validate: {
      game_name: (value) => (value ? null : t('builds.gameRequired')),
      build_name: (value) => (value ? null : t('builds.nameRequired')),
    },
  });

  const fetchBuild = async () => {
    if (!id) return;
    try {
      const build = await BuildsService.getBuildById(id);
      form.setValues({
        game_name: build.game_name,
        build_name: build.build_name,
        description: build.description,
        video_url: build.video_url || '',
      });
      if (build.items_json) {
        setBuildSlots(build.items_json as BuildSlots);
      }
    } catch (error) {
      console.error('Failed to fetch build', error);
      setError('Failed to load build details');
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { GamesService } = await import('@/services/games/games.service');
        const data = await GamesService.getAllGames();
        setGames(data);
      } catch (error) {
        console.error('Failed to fetch games', error);
      }
    };
    fetchGames();
    if (id) {
      fetchBuild();
    }
  }, [id]);

  const handleBuildSave = async (slots: BuildSlots) => {
    if (!form.values.build_name) {
      setError(t('builds.nameRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!userId) throw new Error('You must be logged in to create a build');

      if (id) {
        await BuildsService.updateBuild(id, {
          ...form.values,
          items_json: slots,
        });
        notifications.show({ title: t('common.success'), message: t('builds.buildUpdated'), color: 'green' });
      } else {
        if (source === 'admin') {
            await AdminService.createOfficialBuild({
                ...form.values,
                items_json: slots,
            }, userId);
            notifications.show({ title: t('common.success'), message: t('admin.builds.management'), color: 'green' }); // or buildCreated
        } else {
            await BuildsService.createBuild({
                ...form.values,
                user_id: userId,
                items_json: slots,
            });
            notifications.show({ title: t('common.success'), message: t('builds.buildCreated'), color: 'green' });
        }
      }
      
      if (source === 'admin') {
          navigate('/admin');
      } else {
          navigate('/builds');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save build');
      notifications.show({ title: t('common.error'), message: t('common.error'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">{id ? t('builds.editBuild') : t('builds.createNewBuild')}</Title>

      {error && (
        <Notification icon={<IconX size="1.1rem" />} color="red" title="Error" mb="md" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      <Select
        label={t('builds.game')}
        placeholder={t('common.search')}
        data={['Elden Ring']}
        value="Elden Ring"
        disabled
        description={t('builds.gameSelectionDesc')}
        required
        {...form.getInputProps('game_name')}
        mb="md"
      />

      <TextInput
        withAsterisk
        label={t('builds.buildName')}
        placeholder="Bleed Build, Tank, etc."
        {...form.getInputProps('build_name')}
        mb="md"
      />

      <Textarea
        label={t('builds.description')}
        placeholder="Describe your build strategy..."
        minRows={3}
        {...form.getInputProps('description')}
        mb="md"
      />

      <TextInput
        label={t('builds.videoUrl')}
        placeholder="https://..."
        description={t('builds.videoUrlDesc')}
        {...form.getInputProps('video_url')}
        mb="xl"
      />

      <BuildEditor
        gameName={form.values.game_name}
        initialSlots={buildSlots}
        onSave={handleBuildSave}
        onCancel={() => source === 'admin' ? navigate('/admin') : navigate('/builds')}
      />
    </Container>
  );
};

export default CreateBuild;
