import React, { useEffect, useState } from 'react';
import { Grid, Text, Loader, Center, SegmentedControl, Box } from '@mantine/core';
import { Achievement, AchievementService } from '@/services/achievement.service';
import AchievementCard from './AchievementCard';
import { useAppSelector } from '@/store';

const AchievementsList: React.FC = () => {
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [all, user] = await Promise.all([
        AchievementService.getAllAchievements(),
        AchievementService.getUserAchievements(userId!),
      ]);
      setAllAchievements(all);
      setUserAchievements(user);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Center h={200}><Loader /></Center>;
  }

  const unlockedIds = new Set(userAchievements.map(a => a.id));
  
  const filteredAchievements = allAchievements.filter(achievement => {
    const isUnlocked = unlockedIds.has(achievement.id);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  // Merge unlocked data into all achievements for display
  const displayAchievements = filteredAchievements.map(achievement => {
    const userAchievement = userAchievements.find(ua => ua.id === achievement.id);
    return userAchievement || achievement;
  });

  return (
    <Box>
      <Center mb="xl">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          data={[
            { label: 'All', value: 'all' },
            { label: `Unlocked (${userAchievements.length})`, value: 'unlocked' },
            { label: 'Locked', value: 'locked' },
          ]}
        />
      </Center>

      <Grid>
        {displayAchievements.map((achievement) => (
          <Grid.Col key={achievement.id} span={{ base: 12, md: 6, lg: 4 }}>
            <AchievementCard 
              achievement={achievement} 
              unlocked={unlockedIds.has(achievement.id)} 
            />
          </Grid.Col>
        ))}
      </Grid>
      
      {displayAchievements.length === 0 && (
        <Center h={100}>
          <Text c="dimmed">No achievements found in this category.</Text>
        </Center>
      )}
    </Box>
  );
};

export default AchievementsList;
