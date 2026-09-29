import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wahisnova.imex',
  appName: 'WahisnovaIMEX',
  webDir: 'public',
  server: {
    url: 'https://wahisnovaimex.com',
    cleartext: true
  }
};

export default config;