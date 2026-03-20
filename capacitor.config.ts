import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.droidnas.app',
  appName: 'DroidNAS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
