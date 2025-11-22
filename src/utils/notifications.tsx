import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';

/**
 * Show a success notification
 */
export const showSuccessNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || 'Success',
    message,
    color: 'green',
    icon: <IconCheck size={18} />,
    autoClose: 3000,
  });
};

/**
 * Show an error notification
 */
export const showErrorNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || 'Error',
    message,
    color: 'red',
    icon: <IconX size={18} />,
    autoClose: 5000,
  });
};

/**
 * Show an info notification
 */
export const showInfoNotification = (message: string, title?: string) => {
  notifications.show({
    title: title,
    message,
    color: 'blue',
    icon: <IconInfoCircle size={18} />,
    autoClose: 3000,
  });
};

/**
 * Show a warning notification
 */
export const showWarningNotification = (message: string, title?: string) => {
  notifications.show({
    title: title || 'Warning',
    message,
    color: 'yellow',
    icon: <IconAlertTriangle size={18} />,
    autoClose: 4000,
  });
};

/**
 * Show a loading notification
 * Returns the notification ID for later updates
 */
export const showLoadingNotification = (message: string, id?: string) => {
  const notificationId = id || `loading-${Date.now()}`;
  notifications.show({
    id: notificationId,
    title: 'Loading',
    message,
    loading: true,
    autoClose: false,
    withCloseButton: false,
  });
  return notificationId;
};

/**
 * Update an existing notification
 */
export const updateNotification = (
  id: string,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning'
) => {
  const config = {
    success: {
      color: 'green',
      icon: <IconCheck size={18} />,
      title: 'Success',
      autoClose: 3000,
    },
    error: {
      color: 'red',
      icon: <IconX size={18} />,
      title: 'Error',
      autoClose: 5000,
    },
    info: {
      color: 'blue',
      icon: <IconInfoCircle size={18} />,
      title: 'Info',
      autoClose: 3000,
    },
    warning: {
      color: 'yellow',
      icon: <IconAlertTriangle size={18} />,
      title: 'Warning',
      autoClose: 4000,
    },
  };

  notifications.update({
    id,
    message,
    loading: false,
    withCloseButton: true,
    ...config[type],
  });
};

/**
 * Hide a specific notification
 */
export const hideNotification = (id: string) => {
  notifications.hide(id);
};

/**
 * Clean all notifications
 */
export const cleanNotifications = () => {
  notifications.clean();
};
