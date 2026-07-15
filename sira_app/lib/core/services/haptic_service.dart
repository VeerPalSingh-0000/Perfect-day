import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:haptic_feedback/haptic_feedback.dart';
import 'package:shared_preferences/shared_preferences.dart';

final hapticServiceProvider = Provider<HapticService>((ref) {
  return HapticService();
});

class HapticService {
  Future<bool> get isEnabled async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('tactical_haptics_enabled') ?? true;
  }

  Future<void> toggleHaptics(bool enable) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('tactical_haptics_enabled', enable);
    if (enable) {
      await success(); // feedback that it was turned on
    }
  }

  Future<void> light() async {
    if (await isEnabled) {
      final canVibrate = await Haptics.canVibrate();
      if (canVibrate) {
        await Haptics.vibrate(HapticsType.light);
      }
    }
  }

  Future<void> medium() async {
    if (await isEnabled) {
      final canVibrate = await Haptics.canVibrate();
      if (canVibrate) {
        await Haptics.vibrate(HapticsType.medium);
      }
    }
  }

  Future<void> heavy() async {
    if (await isEnabled) {
      final canVibrate = await Haptics.canVibrate();
      if (canVibrate) {
        await Haptics.vibrate(HapticsType.heavy);
      }
    }
  }

  Future<void> success() async {
    if (await isEnabled) {
      final canVibrate = await Haptics.canVibrate();
      if (canVibrate) {
        await Haptics.vibrate(HapticsType.success);
      }
    }
  }

  Future<void> selection() async {
    if (await isEnabled) {
      final canVibrate = await Haptics.canVibrate();
      if (canVibrate) {
        await Haptics.vibrate(HapticsType.selection);
      }
    }
  }

  Future<void> error() async {
    if (await isEnabled) {
      final canVibrate = await Haptics.canVibrate();
      if (canVibrate) {
        await Haptics.vibrate(HapticsType.error);
      }
    }
  }
}
