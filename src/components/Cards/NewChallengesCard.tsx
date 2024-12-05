import React from 'react';
import { Card, Image, Text, Table, Button, Group, Avatar, ScrollArea } from '@mantine/core';

import { Challenge } from '@/@types/challenge';

interface NewChallengesCardProps {
  challenges: Challenge[]; // Yeni challenge listesi
}

const NewChallengesCard: React.FC<NewChallengesCardProps> = ({ challenges }) => {
  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      h={'100%'}
      style={{
        backgroundImage: 'linear-gradient(145deg, #1e1e2e, #151515)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
        color: 'white',
      }}
    >
      {/* Kart Başlığı */}
      <Text
        size="lg"
        ta="center"
        mb={5}
        style={{
          textDecoration: 'underline',
          textUnderlineOffset: 4,
        }}
      >
        New Challenges
      </Text>

      {/* Tablo */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table highlightOnHover striped>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Game</th>
              <th style={{ textAlign: 'left' }}>Challenge</th>
              <th style={{ textAlign: 'center' }}>More</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((challenge, index) => (
              <tr key={index} style={{ height: 60 }}>
                <td>{challenge.game_name}</td>
                <td
                  style={{
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    marginTop: 0,
                    marginBottom: 0,
                    lineHeight: '1.5',
                  }}
                >
                  {challenge.challenge_name}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <Button variant="outline" color="yellow" size="xs" mr={5}>
                    More
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};

export default NewChallengesCard;
