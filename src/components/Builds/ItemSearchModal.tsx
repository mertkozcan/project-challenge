import { useState, useEffect } from 'react';
import { Modal, TextInput, Stack, ScrollArea, Card, Group, Text, Image, LoadingOverlay, Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { GameItem, ItemCategory } from '@/services/games/gameData.provider';
import { EldenRingProvider } from '@/services/games/eldenRing.provider';

interface ItemSearchModalProps {
  opened: boolean;
  onClose: () => void;
  category: ItemCategory;
  onSelect: (item: GameItem) => void;
  theme?: any;
}

const ItemSearchModal = ({ opened, onClose, category, onSelect, theme }: ItemSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const provider = new EldenRingProvider();
  const primaryColor = theme?.primary || '#228be6';

  useEffect(() => {
    if (opened) {
      setQuery('');
      setItems([]);
      // Load initial items
      searchItems('');
    }
  }, [opened, category]);

  const searchItems = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await provider.searchItems(searchQuery || '', category);
      setItems(results);
    } catch (error) {
      console.error('Failed to search items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchItems(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: GameItem) => {
    onSelect(item);
    onClose();
  };

  const getCategoryLabel = (cat: ItemCategory): string => {
    const labels: Record<ItemCategory, string> = {
      weapons: 'Weapons',
      armors: 'Armor',
      talismans: 'Talismans',
      sorceries: 'Sorceries',
      incantations: 'Incantations',
      shields: 'Shields',
      ashes: 'Ashes of War',
      consumables: 'Consumables',
    };
    return labels[cat];
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Select ${getCategoryLabel(category)}`}
      size="lg"
      styles={{
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: primaryColor,
        },
      }}
    >
      <Stack gap="md">
        <TextInput
          placeholder={`Search ${getCategoryLabel(category).toLowerCase()}...`}
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          autoFocus
        />

        <ScrollArea h={400} style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Stack gap="xs">
            {items.length > 0 ? (
              items.map((item) => (
                <Card
                  key={item.id}
                  padding="md"
                  radius="md"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                  }}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = `1px solid ${primaryColor}`;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <Group>
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        fit="contain"
                      />
                    )}
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Text fw={600} c={primaryColor}>
                        {item.name}
                      </Text>
                      {item.description && (
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {item.description}
                        </Text>
                      )}
                    </Stack>
                  </Group>
                </Card>
              ))
            ) : (
              <Box ta="center" py="xl">
                <Text c="dimmed">
                  {query ? 'No items found' : `Start typing to search ${getCategoryLabel(category).toLowerCase()}`}
                </Text>
              </Box>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export default ItemSearchModal;
