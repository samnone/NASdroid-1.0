import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.droidnas.app',
  appName: 'NASdroid 1.0',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
