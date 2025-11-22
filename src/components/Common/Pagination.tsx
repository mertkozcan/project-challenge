import React from 'react';
import { Group, Button, Text, Pagination as MantinePagination } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 12,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  return (
    <Group justify="space-between" mt="xl">
      {totalItems !== undefined && (
        <Text size="sm" c="dimmed">
          Showing {startItem}-{endItem} of {totalItems} items
        </Text>
      )}

      <MantinePagination
        value={currentPage}
        onChange={onPageChange}
        total={totalPages}
        siblings={1}
        boundaries={1}
      />

      <div style={{ width: totalItems !== undefined ? 'auto' : 0 }} />
    </Group>
  );
};

export default Pagination;
