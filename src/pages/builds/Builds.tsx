import React, { useEffect, useState } from 'react';
import { Container, Title, Tabs, SimpleGrid, Card, Text, Badge, Button, Group, LoadingOverlay } from '@mantine/core';
import { BuildsService } from '@/services/builds/builds.service';
import { Build } from '@/@types/build';
import { IconSword, IconTrophy, IconUsers, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const Builds: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('official');
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuilds();
  }, [activeTab]);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const data = await BuildsService.getBuilds(activeTab === 'official' ? 'official' : 'community');
      setBuilds(data);
    } catch (error) {
      console.error('Failed to fetch builds', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Builds</Title>
        {activeTab === 'community' && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/builds/create')}>
            Create Build
          </Button>
        )}
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="official" leftSection={<IconTrophy size={16} />}>
            Official
          </Tabs.Tab>
          <Tabs.Tab value="community" leftSection={<IconUsers size={16} />}>
            Community
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="official" pt="md">
          <div style={{ position: 'relative', minHeight: 200 }}>
            <LoadingOverlay visible={loading} />
            
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {builds.map((build) => (
                <Card key={build.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{build.build_name}</Text>
                    <Badge color="pink" variant="light">
                      {build.game_name}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {build.description}
                  </Text>

                  <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => navigate(`/builds/${build.id}`)}>
                    View Details
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
            
            {!loading && builds.length === 0 && (
                <Text ta="center" c="dimmed" mt="xl">No official builds yet.</Text>
            )}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="community" pt="md">
          <div style={{ position: 'relative', minHeight: 200 }}>
            <LoadingOverlay visible={loading} />
            
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {builds.map((build) => (
                <Card key={build.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{build.build_name}</Text>
                    <Badge color="pink" variant="light">
                      {build.game_name}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {build.description}
                  </Text>

                  <Text size="xs" c="dimmed" mt="md">
                    By {build.username || 'Unknown'}
                  </Text>

                  <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => navigate(`/builds/${build.id}`)}>
                    View Details
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
            
            {!loading && builds.length === 0 && (
                <Text ta="center" c="dimmed" mt="xl">No community builds yet. Be the first to create one!</Text>
            )}
          </div>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default Builds;
