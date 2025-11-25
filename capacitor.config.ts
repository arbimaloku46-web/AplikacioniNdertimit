import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shikoprogresin.app',
  appName: 'Shiko Progresin',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  backgroundColor: '#002147',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#002147",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#002147",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },
  }
};

export default config;