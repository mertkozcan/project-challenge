import axios from 'axios';
import appConfig from '@/configs/app.config';
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant';
import { PERSIST_STORE_NAME } from '@/constants/app.constant';
import deepParseJson from '@/utils/deepParseJson';
import store, { signOutSuccess } from '../store';
import { showErrorNotification, showWarningNotification } from '@/utils/notifications';

const unauthorizedCode = [401];

const BaseService = axios.create({
  timeout: 60000,
  baseURL: appConfig.apiPrefix,
});

BaseService.interceptors.request.use(
  (config) => {
    const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME);
    const persistData = deepParseJson(rawPersistData);

    let accessToken = (persistData as any).auth.session.token;
    if (!accessToken) {
      const { auth } = store.getState();
      accessToken = auth.session.token;
    }

    if (accessToken) {
      config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

BaseService.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle different error scenarios
    if (!response) {
      // Network error (no response from server)
      showErrorNotification(
        'Unable to connect to the server. Please check your internet connection.',
        'Network Error'
      );
    } else if (unauthorizedCode.includes(response.status)) {
      // 401 Unauthorized
      showWarningNotification(
        'Your session has expired. Please log in again.',
        'Session Expired'
      );
      store.dispatch(signOutSuccess());
    } else if (response.status === 403) {
      // 403 Forbidden
      showErrorNotification(
        'You do not have permission to perform this action.',
        'Access Denied'
      );
    } else if (response.status === 404) {
      // 404 Not Found
      showErrorNotification(
        'The requested resource was not found.',
        'Not Found'
      );
    } else if (response.status >= 500) {
      // 500+ Server Error
      showErrorNotification(
        'A server error occurred. Please try again later.',
        'Server Error'
      );
    } else if (response.status === 400) {
      // 400 Bad Request
      const message = response.data?.message || 'Invalid request. Please check your input.';
      showErrorNotification(message, 'Bad Request');
    } else {
      // Other errors
      const message = response.data?.message || 'An unexpected error occurred.';
      showErrorNotification(message, 'Error');
    }

    return Promise.reject(error);
  }
);

export default BaseService;
