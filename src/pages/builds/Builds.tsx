import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Tabs,
  Grid,
  Button,
  LoadingOverlay,
  Group,
  Text,
  Stack,
  SimpleGrid,
  ThemeIcon,
  Divider,
  Card,
  Image,
  Badge,
} from '@mantine/core';
import { IconPlus, IconSword, IconTrophy, IconUsers, IconFlame, IconStar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { BuildsService } from '@/services/builds/builds.service';
import { Build } from '@/@types/build';
import FilterBar from '@/components/Challenges/FilterBar';
import Pagination from '@/components/Common/Pagination';
import { useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 12;

const Builds: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>('official');
  const [allBuilds, setAllBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { signedIn } = useAppSelector((state) => state.auth.session);

  // Filter states
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBuilds();
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, gameFilter, sortBy]);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const data = await BuildsService.getBuilds(activeTab === 'official' ? 'official' : 'community');
      setAllBuilds(data);
    } catch (error) {
      console.error('Failed to fetch builds', error);
    } finally {
      setLoading(false);
    }
  };

  const gameOptions = useMemo(() => {
    const games = Array.from(new Set(allBuilds.map(b => b.game_name)));
    return games.map(game => ({ value: game, label: game }));
  }, [allBuilds]);

  const filteredBuilds = useMemo(() => {
    let filtered = [...allBuilds];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.build_name.toLowerCase().includes(searchLower) ||
          b.description.toLowerCase().includes(searchLower) ||
          b.game_name.toLowerCase().includes(searchLower)
      );
    }

    if (gameFilter) {
      filtered = filtered.filter(b => b.game_name === gameFilter);
    }

    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
    }

    return filtered;
  }, [allBuilds, search, gameFilter, sortBy]);

  const totalPages = Math.ceil(filteredBuilds.length / ITEMS_PER_PAGE);
  const paginatedBuilds = filteredBuilds.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const featuredBuilds = useMemo(() => {
    return [...allBuilds].slice(0, 3);
  }, [allBuilds]);

  const handleClearFilters = () => {
    setSearch('');
    setGameFilter(null);
    setSortBy('latest');
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingOverlay visible={true} />;
    }

    return (
      <Stack gap="xl">
        {/* Featured Builds */}
        {featuredBuilds.length > 0 && !search && !gameFilter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                <IconFlame size={20} />
              </ThemeIcon>
              <Title order={3}>{t('builds.featuredBuilds')}</Title>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {featuredBuilds.map((build) => (
                <BuildCard key={build.id} build={build} onClick={() => navigate(`/builds/${build.id}`)} />
              ))}
            </SimpleGrid>
            <Divider my="xl" />
          </motion.div>
        )}

        {/* Filter Bar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          gameFilter={gameFilter}
          onGameFilterChange={setGameFilter}
          typeFilter={null}
          onTypeFilterChange={() => {}}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onClearFilters={handleClearFilters}
          games={gameOptions}
        />

        {/* Builds Grid */}
        {paginatedBuilds.length > 0 ? (
          <>
            <Grid>
              {paginatedBuilds.map((build) => (
                <Grid.Col key={build.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <BuildCard build={build} onClick={() => navigate(`/builds/${build.id}`)} />
                </Grid.Col>
              ))}
            </Grid>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredBuilds.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        ) : (
          <Stack align="center" gap="md" py="xl">
            <ThemeIcon size={80} radius="xl" variant="light" color="gray">
              <IconStar size={40} />
            </ThemeIcon>
            <Title order={3} c="dimmed">
              {t('builds.noBuildsFound')}
            </Title>
            <Text c="dimmed" ta="center">
              {activeTab === 'community'
                ? t('builds.noCommunityBuilds')
                : t('builds.noOfficialBuilds')}
            </Text>
            {(search || gameFilter) && (
              <Button variant="light" onClick={handleClearFilters}>
                {t('challenges.clearFilters')}
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    );
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <ThemeIcon size="xl" radius="md" variant="light" color="blue">
            <IconSword size={28} />
          </ThemeIcon>
          <Title order={1}>{t('builds.title')}</Title>
        </Group>
        {activeTab === 'community' && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              if (!signedIn) {
                navigate('/sign-in', { state: { message: t('builds.loginRequiredToCreate') } });
              } else {
                navigate('/builds/create');
              }
            }}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
          >
            {t('builds.createBuild')}
          </Button>
        )}
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="official" leftSection={<IconTrophy size={16} />}>
            {t('builds.official')}
          </Tabs.Tab>
          <Tabs.Tab value="community" leftSection={<IconUsers size={16} />}>
            {t('builds.community')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="official" pt="xl">
          {renderContent()}
        </Tabs.Panel>

        <Tabs.Panel value="community" pt="xl">
          {renderContent()}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

// Build Card Component
const BuildCard: React.FC<{ build: Build; onClick: () => void }> = ({ build, onClick }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        shadow="md"
        padding="lg"
        radius="md"
        withBorder
        style={{ cursor: 'pointer', height: '100%' }}
        onClick={onClick}
      >
        {build.banner_url && (
          <Card.Section>
            <Image
              src={build.banner_url}
              height={160}
              alt={build.build_name}
              fallbackSrc="https://placehold.co/600x400?text=Build"
            />
          </Card.Section>
        )}

        <Stack gap="xs" mt={build.banner_url ? 'md' : 0}>
          <Text fw={700} lineClamp={1}>
            {build.build_name}
          </Text>

          <Badge color="blue" variant="light">
            {build.game_name}
          </Badge>

          <Text size="sm" lineClamp={2} c="dimmed" style={{ minHeight: '2.5rem' }}>
            {build.description}
          </Text>

          {build.username && (
            <Text size="xs" c="dimmed" mt="auto">
              {t('dashboard.by')} {build.username}
            </Text>
          )}
        </Stack>
      </Card>
    </motion.div>
  );
};

export default Builds;
