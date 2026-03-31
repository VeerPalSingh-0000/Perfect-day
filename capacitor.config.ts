import { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: "com.veerpal.perfectday",
  appName: "Perfect Day",
  webDir: "out",
  server: {
    androidScheme: "http",
    cleartext: true,
    allowNavigation: ["*.firebaseapp.com", "*.googleapis.com", "*.gstatic.com"]
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ["google.com"],
    },
  },
};
export default config;
