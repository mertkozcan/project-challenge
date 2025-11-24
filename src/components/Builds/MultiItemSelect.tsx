import { Stack, Text, Group, Badge, ActionIcon, Button, Box } from '@mantine/core';
import { IconX, IconPlus } from '@tabler/icons-react';
import { GameItem } from '@/services/games/gameData.provider';

interface MultiItemSelectProps {
  label: string;
  items: GameItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  theme?: any;
  maxItems?: number;
}

const MultiItemSelect = ({ label, items, onAdd, onRemove, theme, maxItems }: MultiItemSelectProps) => {
  const primaryColor = theme?.primary || '#228be6';
  const canAddMore = !maxItems || items.length < maxItems;

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" fw={600} c={primaryColor}>
          {label}
        </Text>
        {maxItems && (
          <Text size="xs" c="dimmed">
            {items.length} / {maxItems}
          </Text>
        )}
      </Group>

      {items.length > 0 ? (
        <Group gap="xs">
          {items.map((item, index) => (
            <Badge
              key={`${item.id}-${index}`}
              size="lg"
              variant="light"
              color={primaryColor}
              pr={3}
              style={{
                paddingRight: 3,
              }}
            >
              <Group gap={4}>
                <Text size="sm">{item.name}</Text>
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="transparent"
                  onClick={() => onRemove(index)}
                >
                  <IconX size={12} />
                </ActionIcon>
              </Group>
            </Badge>
          ))}
        </Group>
      ) : (
        <Box
          style={{
            padding: '1rem',
            border: '2px dashed rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <Text size="sm" c="dimmed">
            No items selected
          </Text>
        </Box>
      )}

      <Button
        leftSection={<IconPlus size={16} />}
        variant="light"
        color={primaryColor}
        onClick={onAdd}
        disabled={!canAddMore}
        fullWidth
      >
        Add {label}
      </Button>
    </Stack>
  );
};

export default MultiItemSelect;
