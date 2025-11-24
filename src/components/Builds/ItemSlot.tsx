import { Card, Text, Image, ActionIcon, Stack, Box, Tooltip } from '@mantine/core';
import { IconX, IconPlus } from '@tabler/icons-react';
import { GameItem } from '@/services/games/gameData.provider';

interface ItemSlotProps {
  label: string;
  item?: GameItem | null;
  onSelect: () => void;
  onClear: () => void;
  theme?: any;
  disabled?: boolean;
}

const ItemSlot = ({ label, item, onSelect, onClear, theme, disabled = false }: ItemSlotProps) => {
  const primaryColor = theme?.primary || '#228be6';

  return (
    <Stack gap="xs">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Card
        padding="md"
        radius="md"
        style={{
          background: item ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
          border: `2px solid ${item ? primaryColor + '60' : 'rgba(255, 255, 255, 0.1)'}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: 120,
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
        onClick={!disabled ? onSelect : undefined}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.border = `2px solid ${primaryColor}`;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.border = `2px solid ${item ? primaryColor + '60' : 'rgba(255, 255, 255, 0.1)'}`;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {item ? (
          <>
            {/* Clear button */}
            <ActionIcon
              size="sm"
              variant="filled"
              color="red"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <IconX size={14} />
            </ActionIcon>

            {/* Item content */}
            <Stack gap="xs" align="center">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  fit="contain"
                />
              )}
              <Tooltip label={item.name} withArrow>
                <Text
                  size="sm"
                  fw={600}
                  c={primaryColor}
                  ta="center"
                  lineClamp={2}
                  style={{ wordBreak: 'break-word' }}
                >
                  {item.name}
                </Text>
              </Tooltip>
            </Stack>
          </>
        ) : (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <IconPlus size={32} color="rgba(255, 255, 255, 0.3)" />
          </Box>
        )}
      </Card>
    </Stack>
  );
};

export default ItemSlot;
