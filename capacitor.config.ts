import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.veerpal.perfectday',
  appName: 'Perfect Day',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
