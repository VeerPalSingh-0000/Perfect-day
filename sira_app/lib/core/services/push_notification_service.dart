import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../state/providers/auth_provider.dart';

final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  final service = PushNotificationService(ref);
  return service;
});

class PushNotificationService {
  final Ref _ref;
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  
  PushNotificationService(this._ref);

  Future<bool> get isEnabled async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('push_notifications_enabled') ?? false;
  }

  Future<void> initialize() async {
    final enabled = await isEnabled;
    if (enabled) {
      await setupFCM();
    }
  }

  Future<bool> togglePushNotifications(bool enable) async {
    final prefs = await SharedPreferences.getInstance();
    
    if (enable) {
      final success = await setupFCM();
      if (success) {
        await prefs.setBool('push_notifications_enabled', true);
        return true;
      }
      return false;
    } else {
      await _disableFCM();
      await prefs.setBool('push_notifications_enabled', false);
      return true;
    }
  }

  Future<bool> setupFCM() async {
    try {
      NotificationSettings settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional) {
        
        String? token = await _messaging.getToken();
        if (token != null) {
          await _saveTokenToFirestore(token);
        }

        // Listen for token refreshes
        _messaging.onTokenRefresh.listen(_saveTokenToFirestore);
        
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('FCM Setup error: \$e');
      return false;
    }
  }

  Future<void> _disableFCM() async {
    try {
      final authState = _ref.read(authStateProvider);
      final userId = authState.value?.uid;
      
      if (userId != null) {
        await FirebaseFirestore.instance.collection('users').doc(userId).update({
          'fcmToken': FieldValue.delete(),
        });
      }
      
      await _messaging.deleteToken();
    } catch (e) {
      debugPrint('Error disabling FCM: \$e');
    }
  }

  Future<void> _saveTokenToFirestore(String token) async {
    final authState = _ref.read(authStateProvider);
    final userId = authState.value?.uid;

    if (userId != null) {
      try {
        await FirebaseFirestore.instance.collection('users').doc(userId).set({
          'fcmToken': token,
          'fcmTokenUpdatedAt': FieldValue.serverTimestamp(),
        }, SetOptions(merge: true));
      } catch (e) {
        debugPrint('Error saving FCM token: \$e');
      }
    }
  }
}
