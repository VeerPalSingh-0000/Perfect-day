import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../tracker_firebase_options.dart';
import '../../state/providers/auth_provider.dart';

final focusSyncServiceProvider = Provider<FocusSyncService>((ref) {
  final service = FocusSyncService(ref);
  ref.onDispose(() => service.dispose());
  return service;
});

class FocusSyncService {
  final Ref _ref;
  FirebaseApp? _trackerApp;
  FirebaseFirestore? _trackerDb;
  bool _isInitialized = false;

  FocusSyncService(this._ref) {
    _init();
  }

  Future<void> _init() async {
    try {
      // Check if options are configured
      if (TrackerFirebaseOptions.currentPlatform.apiKey == 'YOUR_TRACKER_API_KEY') {
        // print('[FocusSyncService] TrackerFirebaseOptions not configured. Skipping initialization.');
        return;
      }

      _trackerApp = await Firebase.initializeApp(
        name: 'trackerApp',
        options: TrackerFirebaseOptions.currentPlatform,
      );
      _trackerDb = FirebaseFirestore.instanceFor(app: _trackerApp!);
      _isInitialized = true;
      // print('[FocusSyncService] Connected to Tracker DB');
      
      _listenToSessions();
    } catch (e) {
      // print('[FocusSyncService] Failed to initialize: $e');
    }
  }

  void _listenToSessions() {
    if (!_isInitialized || _trackerDb == null) return;

    final user = _ref.read(authStateProvider).value;
    if (user == null) return;

    // Ideally, there should be a linkage between 'Sira' user and 'TrackIT' user.
    // For now, assuming they share the same email or UID if linked.
    
    // This is where you would subscribe to _trackerDb.collection('sessions')
    // and run the same duration map aggregation as the web app.
    // print('[FocusSyncService] Listening to sessions (Not fully implemented without trackerUid)');
  }

  void dispose() {
    // Cancel subscriptions
  }
}
