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
  secondaryItem?: GameItem | null;
  onSecondarySelect?: () => void;
  onSecondaryClear?: () => void;
  secondaryLabel?: string;
}

const ItemSlot = ({ 
  label, 
  item, 
  onSelect, 
  onClear, 
  theme, 
  disabled = false,
  secondaryItem,
  onSecondarySelect,
  onSecondaryClear,
  secondaryLabel = 'Ash of War'
}: ItemSlotProps) => {
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
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <IconX size={14} />
            </ActionIcon>

            {/* Item content */}
            <Stack gap="xs" align="center" style={{ flex: 1 }}>
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

            {/* Secondary Item (Ash of War) */}
            {onSecondarySelect && (
              <Box
                mt="sm"
                pt="xs"
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  width: '100%',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSecondarySelect();
                }}
              >
                <Text size="xs" c="dimmed" ta="center" mb={4}>{secondaryLabel}</Text>
                {secondaryItem ? (
                  <Box 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 4,
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}
                  >
                    <Text size="xs" c={primaryColor} lineClamp={1} style={{ flex: 1, textAlign: 'center' }}>
                      {secondaryItem.name}
                    </Text>
                    <ActionIcon 
                      size="xs" 
                      color="red" 
                      variant="subtle" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onSecondaryClear?.(); 
                      }}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  </Box>
                ) : (
                  <Box 
                    style={{ 
                      border: '1px dashed rgba(255,255,255,0.2)', 
                      borderRadius: 4, 
                      padding: 4, 
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <IconPlus size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    <Text span size="xs" ml={4}>Add</Text>
                  </Box>
                )}
              </Box>
            )}
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
