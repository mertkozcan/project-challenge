import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Paper, Code, Button, LoadingOverlay } from '@mantine/core';
import { BuildsService } from '@/services/builds/builds.service';
import { Build } from '@/@types/build';
import { IconArrowLeft } from '@tabler/icons-react';

const BuildDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBuild = async () => {
      try {
        const data = await BuildsService.getBuildById(id);
        setBuild(data);
      } catch (error) {
        console.error('Failed to fetch build', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuild();
  }, [id]);

  if (loading) return <LoadingOverlay visible={true} />;
  if (!build) return <Text>Build not found</Text>;

  return (
    <Container size="md" py="xl">
      <Button variant="subtle" leftSection={<IconArrowLeft />} onClick={() => navigate('/builds')} mb="md">
        Back to Builds
      </Button>
      
      <Paper shadow="xs" p="xl" withBorder>
        <Title order={2}>{build.build_name}</Title>
        <Text c="dimmed" size="lg" mb="md">{build.game_name} - by {build.username}</Text>
        
        <Title order={4} mt="xl">Description</Title>
        <Text mb="lg">{build.description}</Text>
        
        <Title order={4}>Configuration</Title>
        <Code block mt="sm">{JSON.stringify(build.items_json, null, 2)}</Code>
      </Paper>
    </Container>
  );
};

export default BuildDetail;
