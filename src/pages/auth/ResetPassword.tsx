import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Text,
  Center,
  Anchor,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { supabase } from '@/lib/supabase';
import { IconAlertCircle, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session (Supabase handles the magic link exchange automatically)
    // or if we are just landing here. 
    // Actually, the link contains an access token which Supabase client consumes to set the session.
    // So we should be authenticated when we land here if the link is valid.
    
    // However, it's good practice to handle the case where the session isn't established yet.
    // But for simplicity, we'll assume the user is here to update their password.
  }, []);

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
            navigate('/sign-in');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        Reset Password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={-20} mb={30}>
        Enter your new password below
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        {!success ? (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {error}
                </Alert>
              )}

              <PasswordInput
                label="New Password"
                placeholder="New password"
                required
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm new password"
                required
                {...form.getInputProps('confirmPassword')}
              />

              <Button type="submit" fullWidth loading={loading}>
                Update Password
              </Button>
            </Stack>
          </form>
        ) : (
          <Stack>
            <Alert icon={<IconCheck size={16} />} color="green" title="Password Updated">
              Your password has been reset successfully. Redirecting to login...
            </Alert>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default ResetPassword;
