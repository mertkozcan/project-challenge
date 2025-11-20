import React from 'react';
import { Card, Text, Badge, Button, Group, Grid, Skeleton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

interface BingoChallenge {
  id: number;
  gameName: string; // Oyun adı
  challengeName: string; // Challenge adı
  description: string; // Challenge açıklaması
}

interface BingoChallengesProps {
  challenges: BingoChallenge[]; // Bingo challenge listesi
  loading:boolean
}

const BingoChallenges: React.FC<BingoChallengesProps> = ({ challenges ,loading}) => {
  const navigate = useNavigate();
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
        <Grid.Col span={6} key={index}>
          <Card
            shadow="md"
            padding="lg"
            radius="md"
            h="100%"
            style={{
              backgroundImage: 'linear-gradient(145deg, #1e1e2e, #151515)',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Oyun Adı */}
            {/* Oyun Adı ve Badge */}
            <Group justify="space-between" mb="xs" mt="xs" align="flex-start">
              <Text size="lg" fw={700} lineClamp={2} style={{ minHeight: '3em', lineHeight: '1.3', flex: 1 }}>
                {challenge.gameName}
              </Text>
              <Badge color="pink" variant="filled" size="sm">
                Bingo
              </Badge>
            </Group>

            {/* Challenge Adı */}
            <Text size="md" fw={700} mb={5} lineClamp={2} style={{ minHeight: '2.6em', lineHeight: '1.3' }}>
              {challenge.challengeName}
            </Text>

            {/* Challenge Açıklaması */}
            <Text size="xs" color="gray.4" mt={0} lineClamp={3} style={{ minHeight: '4em', lineHeight: '1.3' }}>
              {challenge.description}
            </Text>

            {/* Katıl Butonu */}
            <Button 
                variant="outline" 
                color="pink" 
                fullWidth 
                mt="auto"
                onClick={() => navigate(`/bingo/${challenge.id}`)}
            >
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
