import { useState } from 'react';
import { Stack, Title, Paper, SimpleGrid, Divider, Button, Group } from '@mantine/core';
import { GameItem } from '@/services/games/gameData.provider';
import ItemSlot from './ItemSlot';
import MultiItemSelect from './MultiItemSelect';
import ItemSearchModal from './ItemSearchModal';
import { getGameTheme } from '@/utils/gameThemes';

export interface BuildSlots {
  // Weapons
  rightHand1?: GameItem | null;
  rightHand2?: GameItem | null;
  rightHand3?: GameItem | null;
  leftHand1?: GameItem | null;
  leftHand2?: GameItem | null;
  leftHand3?: GameItem | null;
  
  // Armor
  head?: GameItem | null;
  chest?: GameItem | null;
  arms?: GameItem | null;
  legs?: GameItem | null;
  
  // Talismans
  talisman1?: GameItem | null;
  talisman2?: GameItem | null;
  talisman3?: GameItem | null;
  talisman4?: GameItem | null;
  
  // Spells (multiple)
  spells: GameItem[];
  
  // Consumables (multiple)
  consumables: GameItem[];
}

interface BuildEditorProps {
  gameName: string;
  initialSlots?: BuildSlots;
  onSave: (slots: BuildSlots) => void;
  onCancel?: () => void;
}

const BuildEditor = ({ gameName, initialSlots, onSave, onCancel }: BuildEditorProps) => {
  const theme = getGameTheme(gameName);
  const [slots, setSlots] = useState<BuildSlots>(initialSlots || {
    spells: [],
    consumables: [],
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{
    key: keyof BuildSlots;
    category: any;
    isMulti?: boolean;
  } | null>(null);

  const openModal = (slotKey: keyof BuildSlots, category: any, isMulti = false) => {
    setCurrentSlot({ key: slotKey, category, isMulti });
    setModalOpen(true);
  };

  const handleItemSelect = (item: GameItem) => {
    if (!currentSlot) return;

    if (currentSlot.isMulti) {
      // For multi-select (spells/consumables)
      const key = currentSlot.key as 'spells' | 'consumables';
      setSlots(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), item],
      }));
    } else {
      // For single slots
      setSlots(prev => ({
        ...prev,
        [currentSlot.key]: item,
      }));
    }
  };

  const clearSlot = (slotKey: keyof BuildSlots) => {
    setSlots(prev => ({
      ...prev,
      [slotKey]: null,
    }));
  };

  const removeMultiItem = (key: 'spells' | 'consumables', index: number) => {
    setSlots(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{
        background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
        border: `1px solid ${theme.primary}20`,
      }}
    >
      <Stack gap="xl">
        <Title order={3} c={theme.primary}>Build Editor</Title>

        {/* Weapons Section */}
        <Stack gap="md">
          <Title order={4} c={theme.primary}>Weapons</Title>
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
            <ItemSlot
              label="Right Hand 1"
              item={slots.rightHand1}
              onSelect={() => openModal('rightHand1', 'weapons')}
              onClear={() => clearSlot('rightHand1')}
              theme={theme}
            />
            <ItemSlot
              label="Right Hand 2"
              item={slots.rightHand2}
              onSelect={() => openModal('rightHand2', 'weapons')}
              onClear={() => clearSlot('rightHand2')}
              theme={theme}
            />
            <ItemSlot
              label="Right Hand 3"
              item={slots.rightHand3}
              onSelect={() => openModal('rightHand3', 'weapons')}
              onClear={() => clearSlot('rightHand3')}
              theme={theme}
            />
            <ItemSlot
              label="Left Hand 1"
              item={slots.leftHand1}
              onSelect={() => openModal('leftHand1', 'weapons')}
              onClear={() => clearSlot('leftHand1')}
              theme={theme}
            />
            <ItemSlot
              label="Left Hand 2"
              item={slots.leftHand2}
              onSelect={() => openModal('leftHand2', 'weapons')}
              onClear={() => clearSlot('leftHand2')}
              theme={theme}
            />
            <ItemSlot
              label="Left Hand 3"
              item={slots.leftHand3}
              onSelect={() => openModal('leftHand3', 'weapons')}
              onClear={() => clearSlot('leftHand3')}
              theme={theme}
            />
          </SimpleGrid>
        </Stack>

        <Divider />

        {/* Armor Section */}
        <Stack gap="md">
          <Title order={4} c={theme.primary}>Armor</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <ItemSlot
              label="Head"
              item={slots.head}
              onSelect={() => openModal('head', 'armors')}
              onClear={() => clearSlot('head')}
              theme={theme}
            />
            <ItemSlot
              label="Chest"
              item={slots.chest}
              onSelect={() => openModal('chest', 'armors')}
              onClear={() => clearSlot('chest')}
              theme={theme}
            />
            <ItemSlot
              label="Arms"
              item={slots.arms}
              onSelect={() => openModal('arms', 'armors')}
              onClear={() => clearSlot('arms')}
              theme={theme}
            />
            <ItemSlot
              label="Legs"
              item={slots.legs}
              onSelect={() => openModal('legs', 'armors')}
              onClear={() => clearSlot('legs')}
              theme={theme}
            />
          </SimpleGrid>
        </Stack>

        <Divider />

        {/* Talismans Section */}
        <Stack gap="md">
          <Title order={4} c={theme.primary}>Talismans</Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            <ItemSlot
              label="Talisman 1"
              item={slots.talisman1}
              onSelect={() => openModal('talisman1', 'talismans')}
              onClear={() => clearSlot('talisman1')}
              theme={theme}
            />
            <ItemSlot
              label="Talisman 2"
              item={slots.talisman2}
              onSelect={() => openModal('talisman2', 'talismans')}
              onClear={() => clearSlot('talisman2')}
              theme={theme}
            />
            <ItemSlot
              label="Talisman 3"
              item={slots.talisman3}
              onSelect={() => openModal('talisman3', 'talismans')}
              onClear={() => clearSlot('talisman3')}
              theme={theme}
            />
            <ItemSlot
              label="Talisman 4"
              item={slots.talisman4}
              onSelect={() => openModal('talisman4', 'talismans')}
              onClear={() => clearSlot('talisman4')}
              theme={theme}
            />
          </SimpleGrid>
        </Stack>

        <Divider />

        {/* Spells Section */}
        <MultiItemSelect
          label="Spells"
          items={slots.spells}
          onAdd={() => openModal('spells', 'sorceries', true)}
          onRemove={(index) => removeMultiItem('spells', index)}
          theme={theme}
          maxItems={12}
        />

        <Divider />

        {/* Consumables Section */}
        <MultiItemSelect
          label="Consumables"
          items={slots.consumables}
          onAdd={() => openModal('consumables', 'consumables', true)}
          onRemove={(index) => removeMultiItem('consumables', index)}
          theme={theme}
          maxItems={10}
        />

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            style={{ background: theme.gradient }}
            onClick={() => onSave(slots)}
          >
            Save Build
          </Button>
        </Group>
      </Stack>

      {/* Item Search Modal */}
      {currentSlot && (
        <ItemSearchModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          category={currentSlot.category}
          onSelect={handleItemSelect}
          theme={theme}
        />
      )}
    </Paper>
  );
};

export default BuildEditor;
