import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Stack,
  Alert,
  Checkbox,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import useAuth from '@/utils/hooks/useAuth';
import { IconAlertCircle } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const location = useLocation();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn({ 
        username: values.email, 
        password: values.password,
        rememberMe: values.rememberMe 
      });
      
      if (result?.status === 'failed') {
        setError(result.message || 'Login failed');
      }
      // If success, useAuth hook will handle navigation
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        Welcome Back!
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}
            
            {(location.state as any)?.message && !error && (
              <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Authentication Required">
                {(location.state as any).message}
              </Alert>
            )}

            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
            />

            <Group justify="space-between" mt="md">
              <Checkbox
                label="Remember me"
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
              />
              <Anchor component={Link} to="/forgot-password" size="sm">
                Forgot password?
              </Anchor>
            </Group>

            <Button type="submit" fullWidth loading={loading} mt="xl">
              Sign In
            </Button>

            <Text ta="center" size="sm">
              Don't have an account?{' '}
              <Anchor component={Link} to="/sign-up" fw={700}>
                Sign Up
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default SignIn;
