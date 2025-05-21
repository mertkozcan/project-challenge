import React, { useState } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Avatar,
  Group,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import classes from './SignUp.module.css';
import * as yup from 'yup';
import { useForm, yupResolver } from '@mantine/form';
import useAuth from '@/utils/hooks/useAuth';
import { SignUpCredential } from '@/@types/auth';
import { useNavigate } from 'react-router-dom';

// Hazır avatarların URL'leri
const avatarList = Array.from({ length: 5 }, (_, i) => `/avatars/avatar${i + 1}.png`);

export default function SignUp() {
  const [loading, setLoading] = useState<boolean>(false);
  const { signUp } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(avatarList[0]);

const navigate = useNavigate();

  // Yup şema tanımı
  const schema = yup.object().shape({
    username: yup
      .string()
      .required('Please enter a username')
      .min(3, 'Username must be at least 3 characters'),
    email: yup.string().required('Please enter an email').email('Invalid email address'),
    password: yup
      .string()
      .required('Please enter a password')
      .min(6, 'Password must be at least 6 characters'),
  });

  // Mantine form yapısı
  const form = useForm<SignUpCredential>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      avatar_url: selectedAvatar,
    },
    validate: yupResolver(schema),
  });

  // Form gönderme işlemi
  async function handleSubmit(values: SignUpCredential) {
    setLoading(true);
    try {
      await signUp({ ...values, avatar_url: selectedAvatar });
       navigate('/sign-in');
      //alert('Registration successful!');
    } catch (e) {
      console.error('Registration failed:', e);
    } finally {
      setLoading(false);
    }
  }

  // Avatar seçme işlemi
  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url);
  };

  return (
    <div>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className={classes.wrapper}>
          <Paper className={classes.form} radius={0} p={30}>
            <Title order={2} className={classes.title} ta="center" mt="md" mb={20}>
              Create Your Account
            </Title>
            <Text ta="center" mt="md" mb={20}>
              Choose your avatar and join the community!
            </Text>

            <Group justify="center" mb={20}>
              <Avatar src={selectedAvatar} size={100} radius="xl" />
            </Group>

            {/* Avatar Carousel */}
            <Carousel
              slideSize="20%"
              slideGap="md"
              ta="center"
              height={150}
              withIndicators
              controlSize={32}
              nextControlIcon={<IconChevronRight size={24} />}
              previousControlIcon={<IconChevronLeft size={24} />}
              emblaOptions={{
                loop: true,
                dragFree: false,
                align: 'center',
              }}
              styles={{
                control: { '&[data-inactive]': { opacity: 1 } },
              }}
            >
              {avatarList.map((url, index) => (
                <Carousel.Slide key={index} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    src={url}
                    size={100}
                    radius="xl"
                    style={{
                      cursor: 'pointer',
                      border: selectedAvatar === url ? '3px solid #228be6' : '1px solid #ccc',
                      transition: '0.3s',
                    }}
                    onClick={() => handleAvatarSelect(url)}
                  />
                </Carousel.Slide>
              ))}
            </Carousel>

            <TextInput
              {...form.getInputProps('username')}
              label="Username"
              withAsterisk
              placeholder="geraltofrivia"
              size="md"
              mt="md"
            />
            <TextInput
              {...form.getInputProps('email')}
              label="Email Address"
              withAsterisk
              placeholder="gamer@gmail.com"
              size="md"
              mt="md"
            />
            <PasswordInput
              {...form.getInputProps('password')}
              label="Password"
              withAsterisk
              placeholder="Your password"
              size="md"
              mt="md"
            />
            <Button loading={loading} type="submit" fullWidth mt="xl" size="md">
              Register
            </Button>
            <Text ta="center" mt="md">
              Already have an account?{' '}
              <Anchor<'a'> href="/sign-in" fw={700} onClick={(event) => event.preventDefault()}>
                Login
              </Anchor>
            </Text>
          </Paper>
        </div>
      </form>
    </div>
  );
}
