import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Stepper,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  SimpleGrid,
  Paper,
  Text,
  ActionIcon,
  Stack,
  LoadingOverlay,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { IconDeviceGamepad2, IconGridDots, IconWand, IconTrash, IconCheck } from '@tabler/icons-react';
import { BingoService } from '@/services/bingo/bingo.service';
import { notifications } from '@mantine/notifications';

const CreateBingo = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);

  const form = useForm({
    initialValues: {
      game_name: '',
      title: '',
      description: '',
      size: 5,
      type: 'Normal', // Normal, Lockout, Blackout
      theme: 'Standard', // Standard, Elden Ring, Dark, etc.
    },
    validate: {
      game_name: (value) => (value ? null : 'Game is required'),
      title: (value) => (value ? null : 'Title is required'),
      description: (value) => (value ? null : 'Description is required'),
    },
  });

  // Initialize tasks array when size changes
  useEffect(() => {
    const totalCells = form.values.size * form.values.size;
    setTasks(Array(totalCells).fill(''));
  }, [form.values.size]);

  const handleNextStep = () => {
    const validation = form.validate();
    if (!validation.hasErrors) {
      setActive((current) => (current < 2 ? current + 1 : current));
    }
  };

  const handlePrevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleAutoFill = async () => {
    if (!form.values.game_name) {
      notifications.show({
        title: 'Error',
        message: 'Please select a game first',
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      const count = form.values.size * form.values.size;
      const randomTasks = await BingoService.getRandomTasks(form.values.game_name, count);
      
      const newTasks = [...tasks];
      randomTasks.forEach((task: any, index: number) => {
        if (index < newTasks.length) {
          newTasks[index] = task.task;
        }
      });
      setTasks(newTasks);
      
      notifications.show({
        title: 'Success',
        message: 'Board auto-filled with random tasks!',
        color: 'green',
      });
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch random tasks',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (tasks.some(t => !t.trim())) {
        notifications.show({
            title: 'Error',
            message: 'Please fill all cells before creating the board.',
            color: 'red'
        });
        return;
    }

    setLoading(true);
    try {
      const cells = tasks.map((task, index) => ({
        row: Math.floor(index / form.values.size),
        col: index % form.values.size,
        task,
      }));

      await BingoService.createBoard({
        ...form.values,
        cells,
      });

      notifications.show({
        title: 'Success',
        message: 'Bingo board created successfully!',
        color: 'green',
      });
      navigate('/bingo/rooms'); // Redirect to lobby
    } catch (error) {
      console.error(error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create bingo board',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">Create New Bingo Board</Title>

      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Setup" description="Board details">
          <Paper withBorder p="xl" radius="md" mt="xl">
            <Stack gap="md">
              <Select
                label="Game"
                placeholder="Select game"
                data={['Elden Ring']}
                {...form.getInputProps('game_name')}
              />
              <TextInput
                label="Title"
                placeholder="e.g. No Hit Run Bingo"
                {...form.getInputProps('title')}
              />
              <Textarea
                label="Description"
                placeholder="Describe the rules..."
                {...form.getInputProps('description')}
              />
              <Group grow>
                <Select
                    label="Size"
                    data={[
                        { value: '3', label: '3x3 (Quick)' },
                        { value: '4', label: '4x4 (Standard)' },
                        { value: '5', label: '5x5 (Long)' },
                    ]}
                    value={form.values.size.toString()}
                    onChange={(val) => form.setFieldValue('size', parseInt(val || '5'))}
                />
                <Select
                    label="Type"
                    data={[
                        { value: 'Normal', label: 'Normal' },
                        { value: 'Lockout', label: 'Lockout' },
                        { value: 'Blackout', label: 'Blackout' },
                    ]}
                    {...form.getInputProps('type')}
                />
                 <Select
                    label="Theme"
                    data={[
                        { value: 'Standard', label: 'Standard' },
                        { value: 'Elden Ring', label: 'Elden Ring' },
                        { value: 'Dark', label: 'Dark Mode' },
                    ]}
                    {...form.getInputProps('theme')}
                />
              </Group>
            </Stack>
          </Paper>
        </Stepper.Step>

        <Stepper.Step label="Grid" description="Fill tasks">
          <Paper withBorder p="xl" radius="md" mt="xl" pos="relative">
            <LoadingOverlay visible={loading} />
            
            <Group justify="space-between" mb="md">
                <Group>
                    <ThemeIcon variant="light" size="lg"><IconGridDots size={20}/></ThemeIcon>
                    <Text fw={700}>Board Editor ({form.values.size}x{form.values.size})</Text>
                </Group>
                <Group>
                    <Button 
                        variant="light" 
                        leftSection={<IconTrash size={16} />} 
                        color="red"
                        onClick={() => setTasks(Array(form.values.size * form.values.size).fill(''))}
                    >
                        Clear
                    </Button>
                    <Button 
                        variant="light" 
                        leftSection={<IconWand size={16} />} 
                        onClick={handleAutoFill}
                    >
                        Auto-fill
                    </Button>
                </Group>
            </Group>

            <SimpleGrid cols={form.values.size} spacing="xs">
              {tasks.map((task, index) => (
                <Textarea
                  key={index}
                  placeholder={`Task ${index + 1}`}
                  value={task}
                  onChange={(e) => handleTaskChange(index, e.currentTarget.value)}
                  minRows={2}
                  maxRows={3}
                  autosize
                  styles={{ input: { textAlign: 'center', fontSize: '0.85rem' } }}
                />
              ))}
            </SimpleGrid>
          </Paper>
        </Stepper.Step>

        <Stepper.Completed>
          <Paper withBorder p="xl" radius="md" mt="xl" ta="center">
            <ThemeIcon size={60} radius="xl" color="green" mb="md">
                <IconCheck size={32} />
            </ThemeIcon>
            <Title order={3} mb="sm">Ready to Create!</Title>
            <Text c="dimmed" mb="xl">
                You are about to create a {form.values.size}x{form.values.size} {form.values.type} bingo board for {form.values.game_name}.
            </Text>
            <Button size="lg" onClick={handleSubmit} loading={loading}>
                Create Board
            </Button>
          </Paper>
        </Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        {active > 0 && active < 2 && (
            <Button variant="default" onClick={handlePrevStep}>Back</Button>
        )}
        {active < 2 && (
            <Button onClick={handleNextStep}>Next step</Button>
        )}
      </Group>
    </Container>
  );
};

export default CreateBingo;
