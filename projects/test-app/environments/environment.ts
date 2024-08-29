import { DdjLogLevel } from 'ddj-angular-common';


export const environment = {
  production: false,
  settingsFile: '/assets/settings.json',
  assetsFolder: '/assets/',
  redirectUri: '/private',
  postLogoutRedirectUri: '/public',
  profileCreationUri: '/private/identification/create',
  ddjLogLevel: DdjLogLevel.Verbose,
  secureApiPaths: 'secure'
};
