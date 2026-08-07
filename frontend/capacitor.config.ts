import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bisleri.vasai',
  appName: 'Bisleri Vasai Store',
  webDir: 'dist',
  server: {
  url: 'https://e-commerce-ap-5jq4.vercel.app',
  cleartext: false
}
};

export default config;
