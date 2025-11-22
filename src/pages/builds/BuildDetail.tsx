import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  LoadingOverlay,
  Grid,
  Box,
  Stack,
  Badge,
  Group,
  Card,
  SimpleGrid,
} from '@mantine/core';
import { BuildsService } from '@/services/builds/builds.service';
import { Build } from '@/@types/build';
import { IconArrowLeft, IconStar } from '@tabler/icons-react';
import BuildHero from '@/components/Build/BuildHero';
import { getGameTheme } from '@/utils/gameThemes';

interface BuildData extends Build {
  banner_url?: string;
  game_icon?: string;
}

const BuildDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState<BuildData | null>(null);
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

  const theme = getGameTheme(build.game_name);

  // Parse items_json if it's a string
  let items: any = {};
  try {
    items = typeof build.items_json === 'string' 
      ? JSON.parse(build.items_json) 
      : build.items_json || {};
  } catch (e) {
    console.error('Failed to parse items_json', e);
  }

  return (
    <Box style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <Container size="xl" pt="md">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft />}
          onClick={() => navigate('/builds')}
          mb="md"
        >
          Back to Builds
        </Button>
      </Container>

      {/* Hero Section */}
      <Container size="xl">
        <BuildHero
          bannerUrl={build.banner_url}
          gameName={build.game_name}
          buildName={build.build_name}
          username={build.username || 'Unknown'}
          isOfficial={build.is_official || false}
        />
      </Container>

      {/* Main Content */}
      <Container size="xl">
        <Grid gutter="xl">
          {/* Left Column - Build Info */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              {/* Description Card */}
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                <Title order={3} mb="md" c={theme.primary}>
                  About This Build
                </Title>
                <Text size="lg" style={{ lineHeight: 1.8 }}>
                  {build.description}
                </Text>
              </Paper>

              {/* Items/Equipment Card */}
              {Object.keys(items).length > 0 && (
                <Paper
                  shadow="md"
                  p="xl"
                  radius="md"
                  style={{
                    background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                    border: `1px solid ${theme.primary}20`,
                  }}
                >
                  <Title order={3} mb="xl" c={theme.primary}>
                    Equipment & Items
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {Object.entries(items).map(([key, value]: [string, any]) => (
                      <Card
                        key={key}
                        padding="md"
                        radius="md"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: `1px solid ${theme.primary}30`,
                        }}
                      >
                        <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                          {key.replace(/_/g, ' ')}
                        </Text>
                        <Text size="md" c={theme.primary}>
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </Text>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Paper>
              )}

              {/* Strategy/Tips Card */}
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                <Title order={3} mb="md" c={theme.primary}>
                  Playstyle & Strategy
                </Title>
                <Text c="dimmed" size="md">
                  This build focuses on maximizing effectiveness through careful equipment selection
                  and strategic gameplay. Follow the item recommendations above for optimal performance.
                </Text>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Right Column - Stats & Info */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xl">
              {/* Build Stats Card */}
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                <Title order={4} mb="xl" c={theme.primary}>
                  Build Statistics
                </Title>
                <Stack gap="md">
                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">
                      Creator
                    </Text>
                    <Text size="lg" fw={600}>
                      {build.username}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">
                      Game
                    </Text>
                    <Text size="lg" fw={600}>
                      {build.game_name}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">
                      Type
                    </Text>
                    <Badge
                      size="lg"
                      color={build.is_official ? 'yellow' : 'blue'}
                      variant="filled"
                    >
                      {build.is_official ? 'Official' : 'Community'}
                    </Badge>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">
                      Created
                    </Text>
                    <Text size="md">
                      {new Date(build.created_at).toLocaleDateString()}
                    </Text>
                  </Box>
                </Stack>
              </Paper>

              {/* Rating Card (Placeholder) */}
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                <Title order={4} mb="md" c={theme.primary}>
                  Community Rating
                </Title>
                <Group justify="center" mb="md">
                  <IconStar size={32} color={theme.primary} fill={theme.primary} />
                  <Text size="2rem" fw={700} c={theme.primary}>
                    4.5
                  </Text>
                </Group>
                <Text size="sm" c="dimmed" ta="center">
                  Based on community feedback
                </Text>
                <Button
                  fullWidth
                  mt="md"
                  variant="light"
                  color="blue"
                  style={{
                    background: theme.gradient,
                  }}
                  onClick={() => {
                    if (!localStorage.getItem('auth')) {
                      navigate('/sign-in', { state: { message: 'You need to be logged in to rate a build.' } });
                    }
                  }}
                >
                  Rate This Build
                </Button>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default BuildDetail;
