import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers/database_provider.dart';
import '../../state/providers/auth_provider.dart';
import '../utils/stats_calculator.dart';
import '../../data/models/day_record.dart';

final dayRecordServiceProvider = Provider<DayRecordService>((ref) {
  final service = DayRecordService(ref);
  ref.onDispose(() => service.dispose());
  return service;
});

class DayRecordService {
  final Ref _ref;
  ProviderSubscription? _tasksSubscription;
  Timer? _debounceTimer;

  DayRecordService(this._ref) {
    _init();
  }

  void _init() {
    _tasksSubscription = _ref.listen<AsyncValue>(tasksProvider, (previous, next) {
      if (next is AsyncData) {
        _debounceSave(next.value);
      }
    });
  }

  void _debounceSave(dynamic tasks) {
    if (_debounceTimer?.isActive ?? false) {
      _debounceTimer!.cancel();
    }
    
    // Wait 2 seconds before saving to avoid spamming Firestore
    _debounceTimer = Timer(const Duration(seconds: 2), () {
      _saveDayRecord(tasks);
    });
  }

  Future<void> _saveDayRecord(List<dynamic> allTasks) async {
    final user = _ref.read(authStateProvider).value;
    if (user == null || allTasks.isEmpty) return;

    final todayStr = StatsCalculator.getTodayDateString();
    
    // Only care about tasks scheduled for today
    final todayTasks = allTasks.where((t) => t.date == todayStr).toList();
    if (todayTasks.isEmpty) return;

    final totalTasks = todayTasks.length;
    final completedTasks = todayTasks.where((t) => t.isCompleted).length;
    final percentage = StatsCalculator.calculateCompletionPercentage(todayTasks.cast());
    final ratingStr = StatsCalculator.calculateDayRating(percentage);
    
    DayRating ratingEnum;
    try {
      ratingEnum = DayRating.values.firstWhere((e) => e.name == ratingStr);
    } catch (e) {
      ratingEnum = DayRating.none;
    }

    final id = "${user.uid}_$todayStr";
    final db = _ref.read(firestoreProvider);
    
    final record = DayRecordModel(
      id: id,
      userId: user.uid,
      date: todayStr,
      totalTasks: totalTasks,
      completedTasks: completedTasks,
      completionPercentage: percentage,
      rating: ratingEnum,
      tasks: todayTasks.cast(),
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );

    try {
      await db
          .collection('users')
          .doc(user.uid)
          .collection('dayRecords')
          .doc(id)
          .set(record.toJson());
    } catch (e) {
      // ignore
    }
  }

  void dispose() {
    _tasksSubscription?.close();
    _debounceTimer?.cancel();
  }
}
