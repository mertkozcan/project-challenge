import React, { useEffect, useState } from 'react';
import { Grid, Card, Text, Title, Divider } from '@mantine/core';
import PopularChallengeCard from '../../components/Cards/PopularChallengeCard';
import NewChallengesCard from '@/components/Cards/NewChallengesCard';
import ChallengeOfTheWeek from '@/components/Cards/ChallengeOfTheWeekCard';
import SloganSection from '@/components/Dashboard/SloganSection';
import BuildChallenges from '@/components/Cards/BuildChallenges';
import BingoChallenges from '@/components/Cards/Bingo Challenges';

import { ChallengesService } from '../../services/challenges/challenges.service';
import { Challenge } from '@/@types/challenge';

const Dashboard: React.FC = () => {
  const [latestChallenges, setLatestChallenges] = useState<Challenge[]>([]);
  const [newChallengesloading, setNewChallengesloading] = useState(true);
  const [PopularChallengeloading, setPopularChallengeloading] = useState(true);
  const [chalOfTheWeekloading, setChalOfTheWeekloading] = useState(true);
  const [bingoChallengesloading, setBingoChallengesloading] = useState(true);
  const [buildChallengesloading, setBuildChallengesloading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        debugger;
        const data = await ChallengesService.getLatestChallenges();
        setLatestChallenges(data);
      } catch (error) {
        console.error('Error fetching latest challenges:', error);
      }
      finally {
        setNewChallengesloading(false);
        setPopularChallengeloading(false);
        setChalOfTheWeekloading(false);
        setBingoChallengesloading(false);
        setBuildChallengesloading(false);
      }
    };

    fetchChallenges();
  }, []);

  const popularChallengeData = {
    gameImage:
      'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1726158298',
    gameName: 'Elden Ring',
    challengeName: 'Godrick the Grafted',
    description: 'Kill Godrick the Grafted.',
    leaderboard: [
      { avatar: 'https://example.com/user1.jpg', name: 'PlayerOne', time: 1200 },
      { avatar: 'https://example.com/user2.jpg', name: 'MageMaster', time: 1100 },
      { avatar: 'https://example.com/user3.jpg', name: 'BossSlayer', time: 1000 },
    ],
  };

  const newChallenges = [
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Elden Ring',
      challengeName: 'Defeat Malenia without taking damage',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'The Legend of Zelda: Breath of the Wild',
      challengeName: 'Defeat a Lynel without taking damage',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'FIFA 23',
      challengeName: 'Score 5 goals with a single player in one match',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Minecraft',
      challengeName: 'Defeat the Ender Dragon without armor',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Call of Duty: Warzone',
      challengeName: 'Win a solo match using only pistols',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Fortnite',
      challengeName: 'Win a match without building',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Overwatch 2',
      challengeName: 'Get 4 gold medals in a single match',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'League of Legends',
      challengeName: 'Win a game with a support champion dealing most damage',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Genshin Impact',
      challengeName: 'Complete a weekly boss with only 3-star characters',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Red Dead Redemption 2',
      challengeName: 'Catch a legendary fish without using bait',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Cyberpunk 2077',
      challengeName: 'Complete a mission without being detected',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Stardew Valley',
      challengeName: 'Earn 1,000 gold in a single day without selling crops',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Mario Kart 8',
      challengeName: 'Finish 1st place in Rainbow Road with 200cc',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Animal Crossing: New Horizons',
      challengeName: 'Decorate your island to get a 5-star rating',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'The Sims 4',
      challengeName: 'Have a Sim achieve max level in all skills',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Apex Legends',
      challengeName: 'Win a match with no shield equipped',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Valorant',
      challengeName: 'Get 10 kills with a pistol in a single match',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Rocket League',
      challengeName: 'Score 5 goals in a single match as a defender',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Among Us',
      challengeName: 'Win as an impostor without killing anyone',
    },
    {
      gameIcon: 'https://via.placeholder.com/40',
      gameName: 'Hades',
      challengeName: 'Clear a run without taking any boons',
    },
  ];

  const cotwLeaderboard = [
    { name: 'PlayerOne', time: 300 }, // 5:00
    { name: 'MageMaster', time: 340 }, // 5:40
    { name: 'BossSlayer', time: 390 }, // 6:30
    { name: 'Player5', time: 450 },
    { name: 'rebelranger', time: 500 },
    { name: 'buizel', time: 655 },
  ];

  const buildChallenges = [
    {
      gameImage:
        'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3ccd3cde-f8c0-480c-ab9d-4db767bda944/dc0qed1-b0a282de-11cc-4844-b601-241b94f6de9b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzNjY2QzY2RlLWY4YzAtNDgwYy1hYjlkLTRkYjc2N2JkYTk0NFwvZGMwcWVkMS1iMGEyODJkZS0xMWNjLTQ4NDQtYjYwMS0yNDFiOTRmNmRlOWIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.0hqnm3A02kq-bPK5UCSumoHiKseVa-QJH-paxA2dn3Y',
      gameName: 'Fallout 4',
      buildName: 'Melee Build',
      description: 'Conquer the wasteland with pure strength and melee weapons!',
    },
    {
      gameImage:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHWS3TCWOCd-df-P4O48JC76fk9Byp8uje5w&s',
      gameName: 'The Elder Scrolls V: Skyrim',
      buildName: 'Mage Build',
      description: 'Become a master of destruction magic and defeat Alduin.',
    },
    {
      gameImage:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQueQFtpY8c-MiiP0xR36ItyR_x_Ef-igWcdw&s',
      gameName: 'Cyberpunk 2077',
      buildName: 'Stealth Hacker',
      description: 'Complete missions using only stealth and quickhacks.',
    },
    {
      gameImage: 'https://cdn2.steamgriddb.com/hero_thumb/2181d94fba9a1d2de2b5f6fb75f8ab08.jpg',
      gameName: 'Dark Souls 3',
      buildName: 'Pyromancer Build',
      description: 'Use the power of fire to conquer Lordran.',
    },
  ];

  const bingoChallenges = [
    {
      gameName: 'Fallout 4',
      challengeName: 'Wasteland Survivor Bingo',
      description: 'Complete challenges across the Commonwealth in a 5x5 bingo grid.',
    },
    {
      gameName: 'Skyrim',
      challengeName: 'Dragonborn Bingo',
      description: 'Slay dragons and complete quests in this ultimate bingo challenge.',
    },
    {
      gameName: 'Dark Souls 3',
      challengeName: 'Firelink Bingo',
      description: 'Defeat bosses and complete achievements in a 4x4 grid.',
    },
  ];

  return (
    <div>
      {/* Slogan */}
      <SloganSection />

      {/* Challenges Başlık */}
      <Title order={3} style={{ marginBottom: '10px', textAlign: 'center' }}>
        Challenges
      </Title>
      <Divider size="sm" style={{ marginBottom: '20px' }} />

      <Grid>
        <Grid.Col span={4} style={{ height: '500px' }}>
          <ChallengeOfTheWeek
            gameName="Elden Ring"
            challengeName="Defeat Malenia without taking damage"
            description="Bu haftanın zorluğu: Malenia'yı hiç hasar almadan yenin!"
            reward="Altın Kılıç"
            leaderboard={cotwLeaderboard}
            loading={chalOfTheWeekloading}
          />
        </Grid.Col>
        <Grid.Col span={4} style={{ height: '500px' }}>
          <PopularChallengeCard {...popularChallengeData} loading={PopularChallengeloading} />
        </Grid.Col>
        <Grid.Col span={4} style={{ height: '500px' }}>
          <NewChallengesCard challenges={latestChallenges} loading={newChallengesloading}/>
        </Grid.Col>
      </Grid>

      {/* Builds Başlık */}
      <Title order={3} style={{ marginTop: '40px', marginBottom: '10px', textAlign: 'center' }}>
        Build Challenges
      </Title>
      <Divider size="sm" style={{ marginBottom: '20px' }} />

      <BuildChallenges builds={buildChallenges} loading={buildChallengesloading}/>

      {/* Bingo Başlık */}
      <Title order={3} style={{ marginTop: '40px', marginBottom: '10px', textAlign: 'center' }}>
        Bingo Challenges
      </Title>
      <Divider size="sm" style={{ marginBottom: '20px' }} />

      <BingoChallenges challenges={bingoChallenges} loading={bingoChallengesloading}/>
    </div>
  );
};

export default Dashboard;
