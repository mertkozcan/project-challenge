import { useState, useEffect } from 'react';
import { Modal, TextInput, Stack, ScrollArea, Card, Group, Text, Image, LoadingOverlay, Box, SimpleGrid } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { GameItem, ItemCategory } from '@/services/games/gameData.provider';
import { EldenRingProvider } from '@/services/games/eldenRing.provider';
import ItemTooltip from './ItemTooltip';

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
      size="xl"
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

        <ScrollArea h={600} style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          {items.length > 0 ? (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
              {items.map((item) => (
                <ItemTooltip
                  key={item.id}
                  itemName={item.name}
                  description={item.description}
                  stats={item.stats}
                  theme={theme}
                >
                  <Card
                    padding="md"
                    radius="md"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = `1px solid ${primaryColor}`;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${primaryColor}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Box 
                      mb="sm" 
                      style={{ 
                        width: 80, 
                        height: 80, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          fit="contain"
                        />
                      ) : (
                        <Box 
                          style={{ 
                            width: 60, 
                            height: 60, 
                            background: 'rgba(255,255,255,0.05)', 
                            borderRadius: '50%' 
                          }} 
                        />
                      )}
                    </Box>
                    
                    <Text 
                      fw={600} 
                      c={primaryColor} 
                      ta="center" 
                      size="sm"
                      lineClamp={2}
                      style={{ width: '100%' }}
                    >
                      {item.name}
                    </Text>
                  </Card>
                </ItemTooltip>
              ))}
            </SimpleGrid>
          ) : (
            <Box ta="center" py="xl">
              <Text c="dimmed">
                {query ? 'No items found' : `Start typing to search ${getCategoryLabel(category).toLowerCase()}`}
              </Text>
            </Box>
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export default ItemSearchModal;
