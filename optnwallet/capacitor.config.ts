import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bitcoinbay.OPTNWallet',
  appName: 'OPTNWallet',
  webDir: 'out',
  "bundledWebRuntime": false,
  server: {
    url: "192.168.0.115",
    cleartext: true
  }
};

export default config;
