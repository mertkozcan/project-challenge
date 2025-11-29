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
import BuildRatingDisplay from '@/components/Builds/BuildRatingDisplay';
import RateBuildSection from '@/components/Builds/RateBuildSection';
import BuildComments from '@/components/Builds/BuildComments';
import BuildRatingService from '@/services/buildRating.service';
import ItemTooltip from '@/components/Builds/ItemTooltip';
import EldenRingBuildView from '@/components/Builds/EldenRingBuildView';

interface BuildData extends Build {
  banner_url?: string;
  game_icon?: string;
  average_rating?: number;
  rating_count?: number;
  comment_count?: number;
}

const BuildDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [build, setBuild] = useState<BuildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchBuild = async () => {
      try {
        const data = await BuildsService.getBuildById(id);
        setBuild(data);
        
        // Fetch user's rating
        try {
          const rating = await BuildRatingService.getUserRating(parseInt(id));
          setUserRating(rating);
        } catch (error) {
          console.error('Failed to fetch user rating', error);
        }
      } catch (error) {
        console.error('Failed to fetch build', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuild();
  }, [id]);

  const handleRatingUpdate = async () => {
    if (!id) return;
    try {
      const data = await BuildsService.getBuildById(id);
      setBuild(data);
      const rating = await BuildRatingService.getUserRating(parseInt(id));
      setUserRating(rating);
    } catch (error) {
      console.error('Failed to refresh build data', error);
    }
  };

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

              {/* Video Showcase Card */}
              {build.video_url && (
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
                    Video Showcase
                  </Title>
                  <Box style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                    <iframe
                      src={(() => {
                        const url = build.video_url;
                        if (url.includes('youtube.com') || url.includes('youtu.be')) {
                          const videoId = url.includes('v=') 
                            ? url.split('v=')[1].split('&')[0] 
                            : url.split('/').pop();
                          return `https://www.youtube.com/embed/${videoId}`;
                        }
                        if (url.includes('twitch.tv')) {
                          const channel = url.split('/').pop();
                          return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
                        }
                        return url;
                      })()}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      frameBorder="0"
                      allowFullScreen
                      title="Build Showcase"
                    />
                  </Box>
                </Paper>
              )}

              {/* Items/Equipment Card */}
              {build.game_name === 'Elden Ring' ? (
                <EldenRingBuildView build={build} theme={theme} />
              ) : (
                Object.keys(items).length > 0 && (
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
                      {Object.entries(items).map(([key, value]: [string, any]) => {
                        // Handle array items (spells, incantations, consumables)
                        if (Array.isArray(value)) {
                          if (value.length === 0) return null;
                          return (
                            <Card
                              key={key}
                              padding="md"
                              radius="md"
                              style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: `1px solid ${theme.primary}30`,
                                gridColumn: '1 / -1', // Span full width
                              }}
                            >
                              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                                {key.replace(/_/g, ' ')}
                              </Text>
                              <Group gap="xs">
                                {value.map((item: any, index: number) => (
                                  <ItemTooltip
                                    key={`${key}-${index}`}
                                    itemName={item.name}
                                    description={item.description}
                                    stats={item.stats}
                                    theme={theme}
                                  >
                                    <Badge
                                      size="lg"
                                      variant="light"
                                      color={theme.primary}
                                      style={{ cursor: 'help' }}
                                    >
                                      {item.name}
                                    </Badge>
                                  </ItemTooltip>
                                ))}
                              </Group>
                            </Card>
                          );
                        }

                        // Skip Ash of War entries as they are handled within their parent weapon card
                        if (key.endsWith('Ash')) return null;

                        // Skip special keys that are handled separately
                        if (['stats', 'startingClass', 'greatRune'].includes(key)) return null;

                        // Handle single items
                        const itemStats = typeof value === 'object' && value !== null ? value : undefined;
                        const displayValue = typeof value === 'object' ? value.name || JSON.stringify(value) : value;

                        if (!displayValue) return null;

                        // Check for associated Ash of War
                        const ashKey = `${key}Ash`;
                        const ashItem = items[ashKey];

                        return (
                          <ItemTooltip
                            key={key}
                            itemName={displayValue}
                            description={itemStats?.description}
                            stats={itemStats}
                            theme={theme}
                          >
                            <Card
                              padding="md"
                              radius="md"
                              style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: `1px solid ${theme.primary}30`,
                                cursor: 'help',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.border = `1px solid ${theme.primary}60`;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.border = `1px solid ${theme.primary}30`;
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <Text size="sm" c="dimmed" tt="uppercase" fw={700} mb="xs">
                                {key.replace(/_/g, ' ')}
                              </Text>
                              <Text size="md" c={theme.primary} fw={600}>
                                {displayValue}
                              </Text>

                              {/* Display Ash of War if present */}
                              {ashItem && (
                                <Group gap="xs" mt="sm" style={{ borderTop: `1px solid ${theme.primary}20`, paddingTop: 8 }}>
                                  <Badge 
                                    size="sm" 
                                    variant="outline" 
                                    color="gray" 
                                    style={{ borderColor: theme.primary, color: theme.primary }}
                                  >
                                    Ash of War
                                  </Badge>
                                  <Text size="sm" c="dimmed">
                                    {ashItem.name}
                                  </Text>
                                </Group>
                              )}
                            </Card>
                          </ItemTooltip>
                        );
                      })}
                    </SimpleGrid>
                  </Paper>
                )
              )}

              {/* Comments Section */}
              <BuildComments buildId={parseInt(id!)} theme={theme} />
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

              {/* Character Stats Card */}
              {items.stats && build.game_name !== 'Elden Ring' && (
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
                    Character Attributes
                  </Title>
                  
                  {items.startingClass && (
                    <Box mb="md">
                      <Text size="sm" c="dimmed" tt="uppercase" fw={700}>Starting Class</Text>
                      <Text size="lg" fw={600}>{items.startingClass.name}</Text>
                    </Box>
                  )}

                  {items.greatRune && (
                    <Box mb="xl">
                      <Text size="sm" c="dimmed" tt="uppercase" fw={700}>Great Rune</Text>
                      <Text size="lg" fw={600} c={theme.primary}>{items.greatRune.name}</Text>
                    </Box>
                  )}

                  <SimpleGrid cols={2} spacing="xs">
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Level</Text>
                      <Text fw={700}>{items.stats.level}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Vigor</Text>
                      <Text fw={700}>{items.stats.vigor}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Mind</Text>
                      <Text fw={700}>{items.stats.mind}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Endurance</Text>
                      <Text fw={700}>{items.stats.endurance}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Strength</Text>
                      <Text fw={700}>{items.stats.strength}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Dexterity</Text>
                      <Text fw={700}>{items.stats.dexterity}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Intelligence</Text>
                      <Text fw={700}>{items.stats.intelligence}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Faith</Text>
                      <Text fw={700}>{items.stats.faith}</Text>
                    </Box>
                    <Box p="xs" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                      <Text size="xs" c="dimmed">Arcane</Text>
                      <Text fw={700}>{items.stats.arcane}</Text>
                    </Box>
                  </SimpleGrid>
                </Paper>
              )}

              {/* Rate Build Section */}
              <RateBuildSection 
                buildId={parseInt(id!)} 
                userRating={userRating}
                onRatingSubmit={handleRatingUpdate}
                averageRating={Number(build.average_rating) || 0}
                ratingCount={Number(build.rating_count) || 0}
                theme={theme}
              />


            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default BuildDetail;
