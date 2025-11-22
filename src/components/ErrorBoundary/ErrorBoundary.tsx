import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Paper, Stack, Code } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { showErrorNotification } from '@/utils/notifications';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Show error notification
    showErrorNotification(
      'An unexpected error occurred. Please try refreshing the page.',
      'Application Error'
    );
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
    
    // TODO: Send error to logging service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <Paper shadow="md" p="xl" radius="md" withBorder style={{ width: '100%' }}>
            <Stack align="center" gap="md">
              <IconAlertTriangle size={64} color="red" />
              
              <Title order={2} ta="center">
                Oops! Something went wrong
              </Title>
              
              <Text c="dimmed" ta="center">
                We're sorry for the inconvenience. An unexpected error has occurred.
              </Text>
              
              {this.state.error && (
                <Paper p="md" withBorder style={{ width: '100%', backgroundColor: 'rgba(255, 0, 0, 0.05)' }}>
                  <Text size="sm" fw={600} mb="xs">
                    Error Details:
                  </Text>
                  <Code block style={{ fontSize: '0.85rem' }}>
                    {this.state.error.toString()}
                  </Code>
                  
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <>
                      <Text size="sm" fw={600} mt="md" mb="xs">
                        Component Stack:
                      </Text>
                      <Code block style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
                        {this.state.errorInfo.componentStack}
                      </Code>
                    </>
                  )}
                </Paper>
              )}
              
              <Stack gap="sm" style={{ width: '100%' }}>
                <Button fullWidth onClick={this.handleReload} size="lg">
                  Reload Page
                </Button>
                <Button fullWidth onClick={this.handleReset} variant="light" size="lg">
                  Try Again
                </Button>
              </Stack>
              
              <Text size="xs" c="dimmed" ta="center">
                If this problem persists, please contact support.
              </Text>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
