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
  const typeOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'permanent', label: 'Permanent' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'reward', label: 'Highest Reward' },
  ];

  const hasActiveFilters = search || gameFilter || typeFilter || sortBy !== 'latest';

  return (
    <Paper p="md" radius="md" withBorder mb="xl">
      <Group gap="md" grow>
        <TextInput
          placeholder="Search challenges..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ flex: 2 }}
        />
        
        {games.length > 0 && (
          <Select
            placeholder="All Games"
            leftSection={<IconFilter size={16} />}
            data={games}
            value={gameFilter}
            onChange={onGameFilterChange}
            clearable
            searchable
          />
        )}
        
        <Select
          placeholder="All Types"
          data={typeOptions}
          value={typeFilter}
          onChange={onTypeFilterChange}
          clearable
        />
        
        <Select
          placeholder="Sort by"
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
            Clear
          </Button>
        )}
      </Group>
    </Paper>
  );
};

export default FilterBar;
