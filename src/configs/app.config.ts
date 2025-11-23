import { LayoutTypes } from '@/@types/layout';

export type AppConfig = {
  apiPrefix: string;
  authenticatedEntryPath: string;
  unAuthenticatedEntryPath: string;
  enableMock: boolean;
  locale: string;
  layoutType: LayoutTypes;
};

const appConfig: AppConfig = {
  layoutType: LayoutTypes.SimpleSideBar,
  apiPrefix: import.meta.env.VITE_API_PREFIX || 'http://localhost:3000/api',
  authenticatedEntryPath: '/dashboard',
  unAuthenticatedEntryPath: '/sign-in',
  enableMock: false,
  locale: 'en',
};

export default appConfig;
