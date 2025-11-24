import React, { useState } from 'react';
import { Container, Title, TextInput, Textarea, Button, Group, Notification } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BuildsService } from '@/services/builds/builds.service';
import { useNavigate } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';
import { useAppSelector } from '@/store';
import BuildEditor, { BuildSlots } from '@/components/Builds/BuildEditor';

const CreateBuild: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildSlots, setBuildSlots] = useState<BuildSlots>({ spells: [], consumables: [] });

  const form = useForm({
    initialValues: {
      game_name: 'Elden Ring',
      build_name: '',
      description: '',
    },

    validate: {
      build_name: (value) => (value ? null : 'Build name is required'),
    },
  });

  const handleBuildSave = async (slots: BuildSlots) => {
    if (!form.values.build_name) {
      setError('Please enter a build name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!userId) throw new Error('You must be logged in to create a build');

      await BuildsService.createBuild({
        ...form.values,
        user_id: userId,
        items_json: slots,
      });
      navigate('/builds');
    } catch (err: any) {
      setError(err.message || 'Failed to create build');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl">Create New Build</Title>

      {error && (
        <Notification icon={<IconX size="1.1rem" />} color="red" title="Error" mb="md" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      <TextInput
        label="Game"
        value="Elden Ring"
        disabled
        mb="md"
        description="Currently only Elden Ring builds are supported. More games coming soon!"
      />

      <TextInput
        withAsterisk
        label="Build Name"
        placeholder="Bleed Build, Tank, etc."
        {...form.getInputProps('build_name')}
        mb="md"
      />

      <Textarea
        label="Description"
        placeholder="Describe your build strategy..."
        minRows={3}
        {...form.getInputProps('description')}
        mb="xl"
      />

      <BuildEditor
        gameName={form.values.game_name}
        initialSlots={buildSlots}
        onSave={handleBuildSave}
        onCancel={() => navigate('/builds')}
      />
    </Container>
  );
};

export default CreateBuild;
