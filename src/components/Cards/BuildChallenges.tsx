import React from 'react';
import { Card, Text, Badge, Button, Group, Image, Grid, Skeleton } from '@mantine/core';

interface BuildChallenge {
  gameImage: string; // Oyun resmi
  gameName: string; // Oyun adı
  buildName: string; // Build adı
  description: string; // Build açıklaması
}

interface BuildChallengeListProps {
  builds: BuildChallenge[]; // Build listesi
  loading:boolean
}

const BuildChallengeList: React.FC<BuildChallengeListProps> = ({ builds, loading }) => {
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
      {builds.map((build, index) => (
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
            {/* Oyun Görseli */}
            <Card.Section>
              <Image
                src={build.gameImage}
                alt={build.gameName}
                height={160}
                w="100%"
                fit="contain"
              />
            </Card.Section>

            {/* Oyun ve Build Bilgileri */}
            <Group justify="space-between" mt="md" mb="xs">
              <Text size="lg" fw={700}>
                {build.gameName}
              </Text>
              <Badge color="cyan" variant="filled">
                Build Challenge
              </Badge>
            </Group>

            <Text size="sm" fw={600} mt="sm">
              {build.buildName}
            </Text>
            <Text size="xs" color="gray.4" mt="xs">
              {build.description}
            </Text>

            {/* Katıl Butonu */}
            <Button variant="outline" color="cyan" fullWidth mt="lg">
              Explore Build
            </Button>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
}
    </>
  );
};

export default BuildChallengeList;
