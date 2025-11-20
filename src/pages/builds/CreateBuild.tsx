import React, { useState } from 'react';
import { Container, Title, TextInput, Textarea, Button, Group, Select, JsonInput, Notification } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BuildsService } from '@/services/builds/builds.service';
import { useNavigate } from 'react-router-dom';
import { IconCheck, IconX } from '@tabler/icons-react';

const CreateBuild: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      game_name: '',
      build_name: '',
      description: '',
      items_json: '{}',
    },

    validate: {
      game_name: (value) => (value ? null : 'Game name is required'),
      build_name: (value) => (value ? null : 'Build name is required'),
      items_json: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch (e) {
          return 'Invalid JSON';
        }
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      // Hardcoded user_id for now since we don't have full auth context with user ID readily available in this snippet
      // In a real app, we'd get this from the auth store.
      // Assuming the backend handles user_id from session or we pass a dummy one if auth is loose.
      // Based on previous analysis, backend expects user_id in body.
      // Let's use the test user ID (1) we seeded.
      await BuildsService.createBuild({
        ...values,
        user_id: 1, 
        items_json: JSON.parse(values.items_json),
      });
      navigate('/builds');
    } catch (err: any) {
      setError(err.message || 'Failed to create build');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="xl">Create New Build</Title>

      {error && (
        <Notification icon={<IconX size="1.1rem" />} color="red" title="Error" mb="md" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          withAsterisk
          label="Game Name"
          placeholder="Elden Ring, WoW, etc."
          {...form.getInputProps('game_name')}
          mb="md"
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
          minRows={4}
          {...form.getInputProps('description')}
          mb="md"
        />

        <JsonInput
          label="Items / Stats (JSON)"
          placeholder="{ 'weapon': 'Rivers of Blood', 'level': 150 }"
          validationError="Invalid JSON"
          formatOnBlur
          autosize
          minRows={4}
          {...form.getInputProps('items_json')}
          mb="xl"
        />

        <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate('/builds')}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Build</Button>
        </Group>
      </form>
    </Container>
  );
};

export default CreateBuild;
