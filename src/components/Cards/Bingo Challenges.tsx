import React from 'react';
import { Card, Text, Badge, Button, Group, Grid, Skeleton } from '@mantine/core';

interface BingoChallenge {
  gameName: string; // Oyun adı
  challengeName: string; // Challenge adı
  description: string; // Challenge açıklaması
}

interface BingoChallengesProps {
  challenges: BingoChallenge[]; // Bingo challenge listesi
  loading:boolean
}

const BingoChallenges: React.FC<BingoChallengesProps> = ({ challenges ,loading}) => {
  return (
    <>
    { loading ? (
        <div>
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} />
        </div>
      ) : 
    <Grid>
      {challenges.map((challenge, index) => (
        <Grid.Col span={4} key={index}>
          <Card
            shadow="md"
            padding="lg"
            radius="md"
            style={{
              backgroundImage: 'linear-gradient(145deg, #1e1e2e, #151515)',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
              color: 'white',
            }}
          >
            {/* Oyun Adı */}
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={700}>
                {challenge.gameName}
              </Text>
              <Badge color="pink" variant="filled">
                Bingo
              </Badge>
            </Group>

            {/* Challenge Adı */}
            <Text size="md" fw={700}>
              {challenge.challengeName}
            </Text>

            {/* Challenge Açıklaması */}
            <Text size="sm" color="gray.4" mt="xs">
              {challenge.description}
            </Text>

            {/* Katıl Butonu */}
            <Button variant="outline" color="pink" fullWidth mt="lg">
              Start Bingo
            </Button>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
}
    </>
  );
};

export default BingoChallenges;
