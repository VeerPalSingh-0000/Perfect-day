import '../../data/models/task.dart';

class StatsCalculator {
  static const Map<TaskPriority, int> priorityWeights = {
    TaskPriority.critical: 4,
    TaskPriority.high: 3,
    TaskPriority.medium: 2,
    TaskPriority.low: 1,
  };

  static int calculateCompletionPercentage(List<TaskModel> tasks, {bool isAdvancedMode = false}) {
    if (tasks.isEmpty) return 0;

    if (!isAdvancedMode) {
      final completedTasks = tasks.where((t) => t.isCompleted).length;
      return ((completedTasks / tasks.length) * 100).round();
    }

    // Advanced mode
    int totalWeight = 0;
    int completedWeight = 0;

    for (final task in tasks) {
      final weight = priorityWeights[task.priority] ?? priorityWeights[TaskPriority.medium]!;
      totalWeight += weight;
      if (task.isCompleted) {
        completedWeight += weight;
      }
    }

    if (totalWeight == 0) return 0;
    return ((completedWeight / totalWeight) * 100).round();
  }

  static String calculateDayRating(int completionPercentage) {
    if (completionPercentage >= 100) return "perfect";
    if (completionPercentage >= 80) return "great";
    if (completionPercentage >= 50) return "good";
    if (completionPercentage >= 20) return "okay";
    if (completionPercentage > 0) return "rough";
    return "none";
  }

  static Map<String, dynamic> getRatingDetails(String rating) {
    switch (rating) {
      case "perfect":
        return {'label': "Perfect Day", 'emoji': "✨"};
      case "great":
        return {'label': "Great Day", 'emoji': "🔥"};
      case "good":
        return {'label': "Good Day", 'emoji': "👍"};
      case "okay":
        return {'label': "Okay Day", 'emoji': "🌤️"};
      case "rough":
        return {'label': "Rough Day", 'emoji': "🌧️"};
      default:
        return {'label': "Planning Phase", 'emoji': "🌱"};
    }
  }

  static String getTimeBasedGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }

  static String getTodayDateString() {
    final d = DateTime.now();
    return "${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}";
  }
}
