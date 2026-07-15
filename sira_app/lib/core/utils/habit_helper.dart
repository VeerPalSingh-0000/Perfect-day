import '../../data/models/task.dart';

class HabitValidityHelper {
  static bool isHabitValidForDate(TaskModel habit, String dateStr) {
    if (habit.frequency == null || habit.frequency == HabitFrequency.daily) return true;

    final parts = dateStr.split('-');
    if (parts.length != 3) return true;
    
    final year = int.tryParse(parts[0]);
    final month = int.tryParse(parts[1]);
    final day = int.tryParse(parts[2]);
    
    if (year == null || month == null || day == null) return true;

    final dateObj = DateTime(year, month, day);
    final dayOfWeek = dateObj.weekday; // 1 = Monday, 7 = Sunday

    if (habit.frequency == HabitFrequency.monSat) {
      return dayOfWeek >= 1 && dayOfWeek <= 6;
    }
    
    if (habit.frequency == HabitFrequency.weekdays) {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    
    if (habit.frequency == HabitFrequency.weekends) {
      return dayOfWeek == 6 || dayOfWeek == 7;
    }
    
    if (habit.frequency == HabitFrequency.alternate) {
      final createdDate = DateTime.fromMillisecondsSinceEpoch(habit.createdAt);
      final createdUTC = DateTime.utc(
        createdDate.year,
        createdDate.month,
        createdDate.day,
      );
      final targetUTC = DateTime.utc(year, month, day);
      final diffTime = (targetUTC.millisecondsSinceEpoch - createdUTC.millisecondsSinceEpoch).abs();
      final diffDays = diffTime ~/ (1000 * 60 * 60 * 24);
      return diffDays % 2 == 0;
    }

    return true;
  }
}
