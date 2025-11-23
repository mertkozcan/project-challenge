import React from 'react';
import { Badge, Tooltip } from '@mantine/core';
import { IconShieldCheck, IconShield, IconShieldLock } from '@tabler/icons-react';

interface TrustBadgeProps {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ level, size = 'md' }) => {
  const getBadgeProps = () => {
    switch (level) {
      case 3:
        return {
          color: 'violet',
          icon: <IconShieldCheck size={14} />,
          label: 'Verified',
          description: 'Level 3: Auto-verified by OCR'
        };
      case 2:
        return {
          color: 'blue',
          icon: <IconShield size={14} />,
          label: 'Trusted',
          description: 'Level 2: Requires 1 peer approval'
        };
      default:
        return {
          color: 'gray',
          icon: <IconShieldLock size={14} />,
          label: 'New',
          description: 'Level 1: Requires 2 peer approvals'
        };
    }
  };

  const { color, icon, label, description } = getBadgeProps();

  return (
    <Tooltip label={description}>
      <Badge 
        size={size} 
        color={color} 
        leftSection={icon}
        variant="light"
      >
        {label}
      </Badge>
    </Tooltip>
  );
};

export default TrustBadge;
