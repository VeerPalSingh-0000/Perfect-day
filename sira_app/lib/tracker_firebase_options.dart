import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

class TrackerFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.linux:
        return web;
      default:
        throw UnsupportedError(
          'TrackerFirebaseOptions are not supported for this platform.',
        );
    }
  }

  // TODO: Paste the web configuration for your tracker Firebase project here
  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDTlgdPLDNOayjDDPrmLnuGFwMm6hPL0iQ',
    appId: '1:568326474806:web:bcb1759f246e04b3ff1c97',
    messagingSenderId: '568326474806',
    projectId: 'perfect-day-007',
    authDomain: 'perfect-day-007.firebaseapp.com',
    storageBucket: 'perfect-day-007.firebasestorage.app',
  );

  // TODO: Paste the Android configuration for your tracker Firebase project here
  // (You can get these from the tracker's google-services.json)
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'YOUR_TRACKER_API_KEY',
    appId: 'YOUR_TRACKER_APP_ID',
    messagingSenderId: 'YOUR_TRACKER_SENDER_ID',
    projectId: 'YOUR_TRACKER_PROJECT_ID',
    storageBucket: 'YOUR_TRACKER_STORAGE_BUCKET',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'YOUR_TRACKER_API_KEY',
    appId: 'YOUR_TRACKER_APP_ID',
    messagingSenderId: 'YOUR_TRACKER_SENDER_ID',
    projectId: 'YOUR_TRACKER_PROJECT_ID',
    storageBucket: 'YOUR_TRACKER_STORAGE_BUCKET',
    iosBundleId: 'com.sira',
  );
}
