import React from 'react';
import { Paper, Image, Text, Center, ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { GameItem } from '@/services/games/gameData.provider';

interface ItemSlotProps {
  label: string;
  item?: GameItem | null;
  onClick: () => void;
  onClear?: () => void;
}

const ItemSlot: React.FC<ItemSlotProps> = ({ label, item, onClick, onClear }) => {
  return (
    <Paper 
      withBorder 
      p="xs" 
      radius="md" 
      style={{ 
        cursor: 'pointer', 
        borderColor: item ? '#fab005' : undefined,
        borderStyle: item ? 'solid' : 'dashed',
        position: 'relative',
        height: '100%'
      }}
      onClick={onClick}
    >
      <Text size="xs" c="dimmed" mb={4} ta="center">{label}</Text>
      
      <Center h={80} bg={item ? 'dark.6' : 'transparent'} style={{ borderRadius: 8 }}>
        {item ? (
          <Image src={item.image} h={70} w="auto" fit="contain" />
        ) : (
          <IconPlus size={24} color="gray" />
        )}
      </Center>

      {item && (
        <Text size="xs" fw={700} ta="center" mt={4} lineClamp={1}>
          {item.name}
        </Text>
      )}

      {item && onClear && (
        <ActionIcon 
          size="xs" 
          color="red" 
          variant="subtle" 
          style={{ position: 'absolute', top: 4, right: 4 }}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <IconX size={12} />
        </ActionIcon>
      )}
    </Paper>
  );
};

export default ItemSlot;
