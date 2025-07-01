import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.panterabot.automatico',
  appName: 'Pantera Bot Automático',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    loggingBehavior: 'debug'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#ea580c",
      sound: "beep.wav",
    },
    Geolocation: {
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    },
    App: {
      launchUrl: "com.panterabot.automatico"
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ea580c",
      showSpinner: true,
      spinnerColor: "#ffffff"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#ea580c"
    }
  }
};

export default config;