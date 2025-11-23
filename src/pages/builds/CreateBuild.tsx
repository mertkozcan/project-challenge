import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Textarea, Button, Group, Select, JsonInput, Notification, Grid, Paper, Text, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BuildsService } from '@/services/builds/builds.service';
import { useNavigate } from 'react-router-dom';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useAppSelector } from '@/store';
import ItemSlot from '@/components/Builds/ItemSlot';
import ItemSearchModal from '@/components/Builds/ItemSearchModal';
import { GameItem, ItemCategory } from '@/services/games/gameData.provider';

const ELDEN_RING_SLOTS = [
  { id: 'right_hand_1', label: 'Right Hand 1', category: 'weapons' },
  { id: 'left_hand_1', label: 'Left Hand 1', category: 'weapons' },
  { id: 'head', label: 'Head', category: 'armors' },
  { id: 'chest', label: 'Chest', category: 'armors' },
  { id: 'arms', label: 'Arms', category: 'armors' },
  { id: 'legs', label: 'Legs', category: 'armors' },
  { id: 'talisman_1', label: 'Talisman 1', category: 'talismans' },
  { id: 'talisman_2', label: 'Talisman 2', category: 'talismans' },
  { id: 'talisman_3', label: 'Talisman 3', category: 'talismans' },
  { id: 'talisman_4', label: 'Talisman 4', category: 'talismans' },
];

const CreateBuild: React.FC = () => {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Visual Editor State
  const [equipment, setEquipment] = useState<Record<string, GameItem>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ id: string; category: ItemCategory } | null>(null);

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

  // Sync equipment state to form JSON when it changes
  useEffect(() => {
    if (form.values.game_name === 'Elden Ring') {
      form.setFieldValue('items_json', JSON.stringify(equipment, null, 2));
    }
  }, [equipment, form.values.game_name]);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      if (!userId) throw new Error('You must be logged in to create a build');

      await BuildsService.createBuild({
        ...values,
        user_id: userId,
        items_json: JSON.parse(values.items_json),
      });
      navigate('/builds');
    } catch (err: any) {
      setError(err.message || 'Failed to create build');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slotId: string, category: string) => {
    setActiveSlot({ id: slotId, category: category as ItemCategory });
    setModalOpen(true);
  };

  const handleItemSelect = (item: GameItem) => {
    if (activeSlot) {
      setEquipment(prev => ({
        ...prev,
        [activeSlot.id]: item
      }));
    }
  };

  const handleSlotClear = (slotId: string) => {
    setEquipment(prev => {
      const newState = { ...prev };
      delete newState[slotId];
      return newState;
    });
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">Create New Build</Title>

      {error && (
        <Notification icon={<IconX size="1.1rem" />} color="red" title="Error" mb="md" onClose={() => setError(null)}>
          {error}
        </Notification>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={12}>
            <Select
              label="Game Name"
              placeholder="Select Game"
              data={['Elden Ring', 'World of Warcraft', 'Other']}
              {...form.getInputProps('game_name')}
              mb="md"
              required
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <TextInput
              withAsterisk
              label="Build Name"
              placeholder="Bleed Build, Tank, etc."
              {...form.getInputProps('build_name')}
              mb="md"
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              label="Description"
              placeholder="Describe your build strategy..."
              minRows={3}
              {...form.getInputProps('description')}
              mb="md"
            />
          </Grid.Col>
        </Grid>

        {form.values.game_name === 'Elden Ring' ? (
          <Paper withBorder p="md" radius="md" mb="xl" bg="dark.8">
            <Text fw={700} mb="md" c="dimmed">Equipment</Text>
            <Grid>
              {ELDEN_RING_SLOTS.map((slot) => (
                <Grid.Col key={slot.id} span={{ base: 6, sm: 4, md: 2.4 }}>
                  <ItemSlot
                    label={slot.label}
                    item={equipment[slot.id]}
                    onClick={() => handleSlotClick(slot.id, slot.category)}
                    onClear={() => handleSlotClear(slot.id)}
                  />
                </Grid.Col>
              ))}
            </Grid>
          </Paper>
        ) : (
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
        )}

        <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate('/builds')}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Build</Button>
        </Group>
      </form>

      <ItemSearchModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        gameName={form.values.game_name}
        onSelect={handleItemSelect}
        initialCategory={activeSlot?.category}
      />
    </Container>
  );
};

export default CreateBuild;
