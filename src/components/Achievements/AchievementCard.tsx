import React from 'react';
import { Paper, Text, Group, ThemeIcon, Tooltip, RingProgress, Center } from '@mantine/core';
import { motion } from 'framer-motion';
import { Achievement } from '@/services/achievement.service';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, unlocked }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          background: unlocked 
            ? 'linear-gradient(145deg, rgba(30, 30, 46, 0.9), rgba(20, 20, 30, 0.9))' 
            : 'rgba(20, 20, 20, 0.5)',
          borderColor: unlocked ? '#fab005' : 'rgba(255, 255, 255, 0.1)',
          opacity: unlocked ? 1 : 0.6,
          filter: unlocked ? 'none' : 'grayscale(100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {unlocked && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, transparent 50%, #fab005 50%)',
            opacity: 0.2
          }} />
        )}

        <Group wrap="nowrap">
          <Center>
            <div style={{ fontSize: '2.5rem' }}>{achievement.icon}</div>
          </Center>

          <div style={{ flex: 1 }}>
            <Text fw={700} size="lg" c={unlocked ? 'white' : 'dimmed'}>
              {achievement.name}
            </Text>
            <Text size="sm" c="dimmed" lineClamp={2}>
              {achievement.description}
            </Text>
            
            {unlocked && (
              <Text size="xs" c="yellow" mt={4} fw={600}>
                Unlocked on {new Date(achievement.unlocked_at!).toLocaleDateString()}
              </Text>
            )}
            
            {!unlocked && (
               <Text size="xs" c="dimmed" mt={4}>
                 Reward: {achievement.xp_reward} XP
               </Text>
            )}
          </div>
        </Group>
      </Paper>
    </motion.div>
  );
};

export default AchievementCard;
