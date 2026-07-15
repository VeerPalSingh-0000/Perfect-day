import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import 'circular_progress_ring.dart';

class DayStatusCard extends StatelessWidget {
  final String emoji;
  final String label;
  final int completedTasks;
  final int totalTasks;
  final int completionPercentage;

  const DayStatusCard({
    super.key,
    required this.emoji,
    required this.label,
    required this.completedTasks,
    required this.totalTasks,
    required this.completionPercentage,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.15)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black,
            blurRadius: 30,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            emoji,
            style: const TextStyle(fontSize: 32),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            totalTasks == 0
                ? "No tasks scheduled for today"
                : "$completedTasks of $totalTasks tasks completed",
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 24),
          CircularProgressRing(
            percentage: completionPercentage.toDouble(),
            trackColor: const Color(0xFF141414),
            progressColor: completionPercentage == 100 ? Colors.white : AppColors.brandLight,
          ),
        ],
      ),
    );
  }
}
