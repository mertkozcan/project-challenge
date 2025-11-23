import React from 'react';
import { Paper, TextInput, Select, Group, Checkbox, Stack } from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';

interface RoomFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  gameFilter: string | null;
  onGameFilterChange: (value: string | null) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  hideFullRooms: boolean;
  onHideFullRoomsChange: (checked: boolean) => void;
  gameOptions: string[];
}

const RoomFilters: React.FC<RoomFiltersProps> = ({
  searchQuery,
  onSearchChange,
  gameFilter,
  onGameFilterChange,
  statusFilter,
  onStatusFilterChange,
  hideFullRooms,
  onHideFullRoomsChange,
  gameOptions
}) => {
  return (
    <Paper p="md" radius="md" withBorder mb="xl">
      <Stack gap="md">
        <Group grow>
          <TextInput
            placeholder="Search rooms or hosts..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
          <Select
            placeholder="Filter by Game"
            leftSection={<IconFilter size={16} />}
            data={[{ value: 'all', label: 'All Games' }, ...gameOptions.map(g => ({ value: g, label: g }))]}
            value={gameFilter || 'all'}
            onChange={(val) => onGameFilterChange(val === 'all' ? null : val)}
            searchable
            clearable
          />
          <Select
            placeholder="Filter by Status"
            data={[
              { value: 'all', label: 'All Statuses' },
              { value: 'WAITING', label: 'Waiting' },
              { value: 'IN_PROGRESS', label: 'In Progress' }
            ]}
            value={statusFilter || 'all'}
            onChange={(val) => onStatusFilterChange(val === 'all' ? null : val)}
          />
        </Group>
        <Checkbox
          label="Hide full rooms"
          checked={hideFullRooms}
          onChange={(e) => onHideFullRoomsChange(e.currentTarget.checked)}
        />
      </Stack>
    </Paper>
  );
};

export default RoomFilters;
