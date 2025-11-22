import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shikoprogresin.app',
  appName: 'Shiko Progresin',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;