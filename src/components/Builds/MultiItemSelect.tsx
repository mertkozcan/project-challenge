import { Stack, Text, Group, Badge, ActionIcon, Button, Box, Paper } from '@mantine/core';
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
        <Stack gap="xs">
          {items.map((item, index) => (
            <Paper 
                key={`${item.id}-${index}`} 
                p="xs" 
                withBorder 
                style={{ 
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderColor: 'rgba(255,255,255,0.1)'
                }}
            >
                <Group wrap="nowrap" align="flex-start">
                    {/* Image */}
                    {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
                    ) : (
                        <Box w={40} h={40} bg="rgba(255,255,255,0.05)" style={{ borderRadius: 4 }} />
                    )}
                    
                    <Stack gap={2} style={{ flex: 1 }}>
                        <Group justify="space-between">
                            <Text size="sm" fw={600}>{item.name}</Text>
                            <ActionIcon
                              size="xs"
                              color="red"
                              variant="subtle"
                              onClick={() => onRemove(index)}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                        </Group>
                        
                        {/* Stats Row */}
                        <Group gap="md">
                            {/* Requirements */}
                            {item.stats?.requirements && (
                                <Group gap={4}>
                                    <Text size="xs" c="dimmed" fw={700}>Req:</Text>
                                    {item.stats.requirements.map((r: any, i: number) => (
                                        <Text key={i} size="xs" c="dimmed">{r.name.substring(0,3)} {r.value}</Text>
                                    ))}
                                </Group>
                            )}
                            
                            {/* Cost */}
                            {item.stats?.cost && (
                                <Text size="xs" c="dimmed">FP: {item.stats.cost}</Text>
                            )}
                            
                            {/* Slots */}
                            {item.stats?.slots && (
                                <Text size="xs" c="dimmed">Slots: {item.stats.slots}</Text>
                            )}
                        </Group>
                        
                        {/* Effect/Description */}
                        {(item.stats?.effects || item.stats?.effect) && (
                             <Text size="xs" c="dimmed" lineClamp={1}>
                                {Array.isArray(item.stats?.effects) ? item.stats.effects.join(', ') : item.stats?.effect}
                             </Text>
                        )}
                    </Stack>
                </Group>
            </Paper>
          ))}
        </Stack>
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
