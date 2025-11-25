import { Tooltip, Stack, Text, Group, Divider, Badge } from '@mantine/core';
import { ReactNode } from 'react';

interface ItemStats {
  attack?: Array<{ name: string; amount: number }>;
  defence?: Array<{ name: string; amount: number }>;
  scaling?: Array<{ name: string; scaling: string }>;
  requirements?: Array<{ name: string; amount: number }>;
  effects?: string;
  weight?: number;
  category?: string;
}

interface ItemTooltipProps {
  itemName: string;
  description?: string;
  stats?: ItemStats;
  children: ReactNode;
  theme?: any;
}

const ItemTooltip = ({ itemName, description, stats, children, theme }: ItemTooltipProps) => {
  const primaryColor = theme?.primary || '#228be6';

  if (!stats || Object.keys(stats).length === 0) {
    // No stats available, just show basic tooltip
    return (
      <Tooltip label={itemName} withArrow>
        {children}
      </Tooltip>
    );
  }

  const tooltipContent = (
    <Stack gap="xs" style={{ maxWidth: 300 }}>
      <Text size="sm" fw={700} c={primaryColor}>{itemName}</Text>
      
      {description && (
        <>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
            {description}
          </Text>
          <Divider />
        </>
      )}

      {stats.category && (
        <Group gap="xs">
          <Badge size="xs" variant="light">{stats.category}</Badge>
          {stats.weight !== undefined && (
            <Text size="xs" c="dimmed">Weight: {stats.weight}</Text>
          )}
        </Group>
      )}

      {stats.attack && stats.attack.length > 0 && (
        <>
          <Text size="xs" fw={600} c={primaryColor}>Attack</Text>
          <Stack gap={2}>
            {stats.attack.map((atk, idx) => (
              <Group key={idx} justify="space-between" gap="xs">
                <Text size="xs" c="dimmed">{atk.name}</Text>
                <Text size="xs" fw={500}>{atk.amount}</Text>
              </Group>
            ))}
          </Stack>
        </>
      )}

      {stats.defence && stats.defence.length > 0 && (
        <>
          <Text size="xs" fw={600} c={primaryColor}>Defence</Text>
          <Stack gap={2}>
            {stats.defence.map((def, idx) => (
              <Group key={idx} justify="space-between" gap="xs">
                <Text size="xs" c="dimmed">{def.name}</Text>
                <Text size="xs" fw={500}>{def.amount}</Text>
              </Group>
            ))}
          </Stack>
        </>
      )}

      {stats.scaling && stats.scaling.length > 0 && (
        <>
          <Text size="xs" fw={600} c={primaryColor}>Scaling</Text>
          <Group gap="xs">
            {stats.scaling.map((scale: any, idx: number) => (
              <Badge key={idx} size="xs" variant="outline">
                {scale.name}: {scale.scaling}
              </Badge>
            ))}
          </Group>
        </>
      )}

      {stats.requirements && stats.requirements.length > 0 && (
        <>
          <Text size="xs" fw={600} c={primaryColor}>Requirements</Text>
          <Group gap="xs">
            {stats.requirements.map((req: any, idx: number) => (
              <Text key={idx} size="xs" c="dimmed">
                {req.name}: {req.amount}
              </Text>
            ))}
          </Group>
        </>
      )}

      {stats.effects && (
        <>
          <Text size="xs" fw={600} c={primaryColor}>Effects</Text>
          <Text size="xs" c="dimmed">{stats.effects}</Text>
        </>
      )}
    </Stack>
  );

  return (
    <Tooltip 
      label={tooltipContent} 
      withArrow 
      multiline
      w={300}
      position="top"
      transitionProps={{ transition: 'fade', duration: 200 }}
      styles={{
        tooltip: {
          backgroundColor: 'rgba(25, 25, 35, 0.98)',
          border: `1px solid ${primaryColor}30`,
          color: '#e0e0e0',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          padding: '12px',
        },
        arrow: {
          border: `1px solid ${primaryColor}30`,
          backgroundColor: 'rgba(25, 25, 35, 0.98)',
        }
      }}
    >
      {children}
    </Tooltip>
  );
};

export default ItemTooltip;
