import { DdjLogLevel } from 'ddj-angular-common';

export const environment = {
  production: true,
  settingsFile: '/assets/settings.json',
  assetsFolder: '/assets/',
  redirectUri: '/private',
  postLogoutRedirectUri: '/public',
  profileCreationUri: '/private/identification/create',
  ddjLogLevel: DdjLogLevel.Error,
   secureApiPaths: 'secure'
};
