import React from 'react';
import { Grid, Card, Text } from '@mantine/core';
import PopularChallengeCard from '../../components/Cards/PopularChallengeCard';

const Dashboard: React.FC = () => {
  const popularChallengeData = {
    gameImage: 'https://placehold.co/500x160',
    gameName: 'Elden Ring',
    challengeName: 'Godrick the Grafted',
    description: 'Kill Godrick the Grafted.',
    leaderboard: [
      { avatar: 'https://example.com/user1.jpg', name: 'PlayerOne', time: 1200 },
      { avatar: 'https://example.com/user2.jpg', name: 'MageMaster', time: 1100 },
      { avatar: 'https://example.com/user3.jpg', name: 'BossSlayer', time: 1000 },
    ],
  };

  return (
    <Grid>
      <Grid.Col span={4}>
        <PopularChallengeCard {...popularChallengeData} />
      </Grid.Col>
      <Grid.Col span={4}>
        <PopularChallengeCard {...popularChallengeData} />
      </Grid.Col>
      <Grid.Col span={4}>
        <PopularChallengeCard {...popularChallengeData} />
      </Grid.Col>
      <Grid.Col span={4}>
        <PopularChallengeCard {...popularChallengeData} />
      </Grid.Col>
      <Grid.Col span={4}>
        <PopularChallengeCard {...popularChallengeData} />
      </Grid.Col>
      <Grid.Col span={4}>
        <PopularChallengeCard {...popularChallengeData} />
      </Grid.Col>
    </Grid>
  );
};

export default Dashboard;
