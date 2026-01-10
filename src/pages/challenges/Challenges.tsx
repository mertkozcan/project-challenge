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
} from '@mantine/core';
import { IconPlus, IconTrophy, IconUsers, IconFlame, IconStar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ChallengesService } from '@/services/challenges/challenges.service';
import type { Challenge } from '@/@types/challenge';
import FilterBar from '@/components/Challenges/FilterBar';
import ChallengeCard from '@/components/Challenges/ChallengeCard';
import Pagination from '@/components/Common/Pagination';
import useAuth from '@/utils/hooks/useAuth';

const ITEMS_PER_PAGE = 12;

import { useTranslation } from 'react-i18next';

const Challenges: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('official');
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const { t } = useTranslation();

  // Filter states
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchChallenges();
  }, [activeTab]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [search, gameFilter, typeFilter, sortBy]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await ChallengesService.getChallenges(
        undefined,
        activeTab === 'official' ? 'official' : 'community'
      );
      setAllChallenges(data);
    } catch (error) {
      console.error('Failed to fetch challenges', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique games for filter
  const gameOptions = useMemo(() => {
    const games = Array.from(new Set(allChallenges.map(c => c.game_name)));
    return games.map(game => ({ value: game, label: game }));
  }, [allChallenges]);

  // Filter and sort challenges
  const filteredChallenges = useMemo(() => {
    let filtered = [...allChallenges];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.challenge_name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower) ||
          c.game_name.toLowerCase().includes(searchLower)
      );
    }

    // Game filter
    if (gameFilter) {
      filtered = filtered.filter(c => c.game_name === gameFilter);
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    // Sort
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.participation_count || 0) - (a.participation_count || 0));
        break;
      case 'reward':
        filtered.sort((a, b) => (b.reward_xp || 0) - (a.reward_xp || 0));
        break;
    }

    return filtered;
  }, [allChallenges, search, gameFilter, typeFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  const paginatedChallenges = filteredChallenges.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Featured challenges (top 3 popular)
  const featuredChallenges = useMemo(() => {
    return [...allChallenges]
      .sort((a, b) => (b.participation_count || 0) - (a.participation_count || 0))
      .slice(0, 3);
  }, [allChallenges]);

  const handleClearFilters = () => {
    setSearch('');
    setGameFilter(null);
    setTypeFilter(null);
    setSortBy('latest');
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingOverlay visible={true} />;
    }

    return (
      <Stack gap="xl">
        {/* Featured Section */}
        {featuredChallenges.length > 0 && !search && !gameFilter && !typeFilter && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Group mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                <IconFlame size={20} />
              </ThemeIcon>
              <Title order={3}>{t('challenges.popularThisWeek')}</Title>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {featuredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  id={challenge.id}
                  name={challenge.challenge_name}
                  description={challenge.description}
                  gameName={challenge.game_name}
                  type={challenge.type}
                  reward={challenge.reward_xp}
                  bannerUrl={challenge.banner_url}
                  participantCount={challenge.participation_count}
                />
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
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onClearFilters={handleClearFilters}
          games={gameOptions}
        />

        {/* Challenges Grid */}
        {paginatedChallenges.length > 0 ? (
          <>
            <Grid>
              {paginatedChallenges.map((challenge) => (
                <Grid.Col key={challenge.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <ChallengeCard
                    id={challenge.id}
                    name={challenge.challenge_name}
                    description={challenge.description}
                    gameName={challenge.game_name}
                    type={challenge.type}
                    reward={challenge.reward_xp}
                    bannerUrl={challenge.banner_url}
                    participantCount={challenge.participation_count}
                  />
                </Grid.Col>
              ))}
            </Grid>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredChallenges.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        ) : (
          <Stack align="center" gap="md" py="xl">
            <ThemeIcon size={80} radius="xl" variant="light" color="gray">
              <IconStar size={40} />
            </ThemeIcon>
            <Title order={3} c="dimmed">
              {t('challenges.noChallengesFound')}
            </Title>
            <Text c="dimmed" ta="center">
              {activeTab === 'community'
                ? t('challenges.noCommunityChallenges')
                : t('challenges.noOfficialChallenges')}
            </Text>
            {(search || gameFilter || typeFilter) && (
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
            <IconTrophy size={28} />
          </ThemeIcon>
          <Title order={1}>{t('challenges.title')}</Title>
        </Group>
        {activeTab === 'community' && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              if (!authenticated) {
                navigate('/sign-in', { state: { message: t('challenges.createChallengeAuthMsg') } });
              } else {
                navigate('/challenges/create');
              }
            }}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
          >
            {t('challenges.createChallenge')}
          </Button>
        )}
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="official" leftSection={<IconTrophy size={16} />}>
            {t('challenges.official')}
          </Tabs.Tab>
          <Tabs.Tab value="community" leftSection={<IconUsers size={16} />}>
            {t('challenges.community')}
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

export default Challenges;