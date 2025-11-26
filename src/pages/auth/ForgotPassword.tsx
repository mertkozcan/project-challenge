import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Text,
  Anchor,
  Stack,
  Alert,
  Center,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import useAuth from '@/utils/hooks/useAuth';
import { IconAlertCircle, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await resetPassword(values.email);
      
      if (result?.status === 'failed') {
        setError(result.message || 'Failed to send reset email');
      } else {
        setSuccess(true);
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
        Forgot Password?
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={-20} mb={30}>
        Enter your email to get a reset link
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

              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
              />

              <Button type="submit" fullWidth loading={loading}>
                Send Reset Link
              </Button>

              <Center>
                <Anchor component={Link} to="/sign-in" size="sm" c="dimmed">
                  <Center inline>
                    <IconArrowLeft size={12} stroke={1.5} />
                    <Box ml={5}>Back to Sign In</Box>
                  </Center>
                </Anchor>
              </Center>
            </Stack>
          </form>
        ) : (
          <Stack>
            <Alert icon={<IconCheck size={16} />} color="green" title="Email Sent">
              Check your inbox for a password reset link.
            </Alert>
            <Button component={Link} to="/sign-in" fullWidth variant="outline">
              Back to Sign In
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
