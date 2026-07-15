import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class MetricCard extends StatelessWidget {
  final int value;
  final String label;
  final IconData icon;
  final Color activeColor;

  const MetricCard({
    super.key,
    required this.value,
    required this.label,
    required this.icon,
    required this.activeColor,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = value > 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? activeColor.withValues(alpha: 0.1) : const Color(0xFF1A1A1A),
              border: Border.all(
                color: isActive ? activeColor.withValues(alpha: 0.2) : Colors.transparent,
              ),
            ),
            child: Icon(
              icon,
              color: isActive ? activeColor : AppColors.textMuted,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value.toString(),
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: isActive ? AppColors.textPrimary : AppColors.textMuted,
                  height: 1.1,
                ),
              ),
              Text(
                label.toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.5,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
