import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.veerpal.perfectday",
  appName: "Perfect Day",
  webDir: "out",
  server: {
    androidScheme: "https",
    hostname: "localhost",
    cleartext: true,
    allowNavigation: ["*.firebaseapp.com", "*.googleapis.com", "*.gstatic.com"],
    // url: "http://192.168.1.9:3000"
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com"],
    },
  },
};

export default config;