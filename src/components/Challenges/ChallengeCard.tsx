import React from 'react';
import { Card, Text, Badge, Group, Stack, Image } from '@mantine/core';
import { IconUsers, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ChallengeCardProps {
  id: number;
  name: string;
  description: string;
  gameName: string;
  type: string;
  reward: number;
  bannerUrl?: string;
  participantCount?: number;
}

import { useTranslation } from 'react-i18next';

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  id,
  name,
  description,
  gameName,
  type,
  reward,
  bannerUrl,
  participantCount,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'green';
      case 'weekly': return 'blue';
      case 'permanent': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        shadow="md"
        padding="lg"
        radius="md"
        withBorder
        style={{ cursor: 'pointer', height: '100%' }}
        onClick={() => navigate(`/challenges/${id}`)}
      >
        {bannerUrl && (
          <Card.Section>
            <Image
              src={bannerUrl}
              height={160}
              alt={name}
              fallbackSrc="https://placehold.co/600x400?text=Challenge"
            />
          </Card.Section>
        )}

        <Stack gap="xs" mt={bannerUrl ? 'md' : 0}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={700} lineClamp={1} style={{ flex: 1 }}>
              {name}
            </Text>
            <Badge color={getChallengeTypeColor(type)} variant="light">
              {t(`challenges.${type}`)}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed">
            {gameName}
          </Text>

          <Text size="sm" lineClamp={2} style={{ minHeight: '2.5rem' }}>
            {description}
          </Text>

          <Group justify="space-between" mt="auto" pt="md">
            <Group gap="xs">
              <IconTrophy size={16} color="gold" />
              <Text size="sm" c="yellow" fw={600}>
                {reward} XP
              </Text>
            </Group>

            {participantCount !== undefined && (
              <Group gap={4}>
                <IconUsers size={16} />
                <Text size="sm" c="dimmed">
                  {participantCount}
                </Text>
              </Group>
            )}
          </Group>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default ChallengeCard;
