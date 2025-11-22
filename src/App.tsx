import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme';
import { Layout } from '@/components/Layout/Layout';
import { Provider } from 'react-redux';
import store, { persistor } from '@/store';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import appConfig from './configs/app.config';
import { mockServer } from './mock/mock';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { NotificationProvider } from '@/context/NotificationContext';

export default function App() {
  /**
   * Set enableMock(Default true) to true at configs/app.config.js
   * If you wish to enable mock api
   */
  if (appConfig.enableMock) {
    mockServer();
  }

  return (
    <ErrorBoundary>
      <MantineProvider forceColorScheme="dark" theme={theme}>
        <Notifications position="top-right" zIndex={1000} />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NotificationProvider>
              <BrowserRouter>
                <Layout />
              </BrowserRouter>
            </NotificationProvider>
          </PersistGate>
        </Provider>
      </MantineProvider>
    </ErrorBoundary>
  );
}
