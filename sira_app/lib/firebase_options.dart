import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    // TODO: The user should run `flutterfire configure` to generate the correct configuration.
    // For now, this is a placeholder to allow the project to compile.
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        return web; // Provide dummy options to prevent immediate crash on Linux
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyDTlgdPLDNOayjDDPrmLnuGFwMm6hPL0iQ',
    appId: '1:568326474806:web:bcb1759f246e04b3ff1c97', // Using a generic web format
    messagingSenderId: '568326474806',
    projectId: 'perfect-day-007',
    authDomain: 'perfect-day-007.firebaseapp.com',
    storageBucket: 'perfect-day-007.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDTlgdPLDNOayjDDPrmLnuGFwMm6hPL0iQ',
    appId: '1:568326474806:android:bcb1759f246e04b3ff1c97',
    messagingSenderId: '568326474806',
    projectId: 'perfect-day-007',
    storageBucket: 'perfect-day-007.firebasestorage.app',
  );
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBx0QEALdznifOYUbkrM_-ewzn_ntkZ-6w',
    appId: '1:568326474806:ios:e86ffdd87894c0abff1c97',
    messagingSenderId: '568326474806',
    projectId: 'perfect-day-007',
    storageBucket: 'perfect-day-007.firebasestorage.app',
    androidClientId: '568326474806-59nj1rf26g252r11voivsv4v6hadlvu7.apps.googleusercontent.com',
    iosClientId: '568326474806-pnoidrg05ip963olt9pvo4hu2s23du8k.apps.googleusercontent.com',
    iosBundleId: 'com.sira.siraApp',
  );
  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'dummy_api_key',
    appId: 'dummy_app_id',
    messagingSenderId: 'dummy_sender_id',
    projectId: 'dummy_project_id',
    storageBucket: 'dummy_storage_bucket',
    iosBundleId: 'com.sira',
  );
}
