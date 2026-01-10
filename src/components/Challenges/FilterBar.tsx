import React from 'react';
import { TextInput, Select, Group, Button, Paper } from '@mantine/core';
import { IconSearch, IconX, IconFilter } from '@tabler/icons-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  gameFilter: string | null;
  onGameFilterChange: (value: string | null) => void;
  typeFilter: string | null;
  onTypeFilterChange: (value: string | null) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onClearFilters: () => void;
  games?: { value: string; label: string }[];
}

import { useTranslation } from 'react-i18next';

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  gameFilter,
  onGameFilterChange,
  typeFilter,
  onTypeFilterChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  games = [],
}) => {
  const { t } = useTranslation();

  const typeOptions = [
    { value: 'daily', label: t('challenges.daily') },
    { value: 'weekly', label: t('challenges.weekly') },
    { value: 'permanent', label: t('challenges.permanent') },
  ];

  const sortOptions = [
    { value: 'latest', label: t('challenges.latest') },
    { value: 'popular', label: t('challenges.popular') },
    { value: 'reward', label: t('challenges.reward') },
  ];

  const hasActiveFilters = search || gameFilter || typeFilter || sortBy !== 'latest';

  return (
    <Paper p="md" radius="md" withBorder mb="xl">
      <Group gap="md" grow>
        <TextInput
          placeholder={t('challenges.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ flex: 2 }}
        />
        
        {games.length > 0 && (
          <Select
            placeholder={t('common.search')}
            leftSection={<IconFilter size={16} />}
            data={games}
            value={gameFilter}
            onChange={onGameFilterChange}
            clearable
            searchable
          />
        )}
        
        <Select
          placeholder={t('challenges.community')}
          data={typeOptions}
          value={typeFilter}
          onChange={onTypeFilterChange}
          clearable
        />
        
        <Select
          placeholder={t('challenges.sortBy')}
          data={sortOptions}
          value={sortBy}
          onChange={(value) => onSortByChange(value || 'latest')}
        />
        
        {hasActiveFilters && (
          <Button
            variant="light"
            color="red"
            leftSection={<IconX size={16} />}
            onClick={onClearFilters}
          >
            {t('common.search')}
          </Button>
        )}
      </Group>
    </Paper>
  );
};

export default FilterBar;
