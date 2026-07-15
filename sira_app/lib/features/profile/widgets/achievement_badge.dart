import 'package:flutter/material.dart';

class AchievementBadge extends StatelessWidget {
  final String id;
  final String title;
  final String icon;
  final String desc;
  final bool isUnlocked;

  const AchievementBadge({
    super.key,
    required this.id,
    required this.title,
    required this.icon,
    required this.desc,
    required this.isUnlocked,
  });

  @override
  Widget build(BuildContext context) {
    Color borderColor;
    List<Color> gradientColors;
    Color textColor;

    if (!isUnlocked) {
      borderColor = Colors.white.withValues(alpha: 0.05);
      gradientColors = [
        const Color(0xFF08080A).withValues(alpha: 0.6),
        const Color(0xFF08080A).withValues(alpha: 0.6),
      ];
      textColor = Colors.grey;
    } else {
      switch (id) {
        case 'first_perfect':
          borderColor = Colors.amber.withValues(alpha: 0.35);
          gradientColors = [const Color(0xFF1c160c), const Color(0xFF2b1f0a)];
          textColor = Colors.amber.shade200;
          break;
        case 'streak_7':
          borderColor = Colors.orange.withValues(alpha: 0.35);
          gradientColors = [const Color(0xFF1c100c), const Color(0xFF2d160a)];
          textColor = Colors.orange.shade200;
          break;
        case 'streak_30':
          borderColor = Colors.cyan.withValues(alpha: 0.35);
          gradientColors = [const Color(0xFF0c1c1e), const Color(0xFF0a2c2e)];
          textColor = Colors.cyan.shade200;
          break;
        case 'tasks_100':
          borderColor = Colors.purple.withValues(alpha: 0.35);
          gradientColors = [const Color(0xFF140c1e), const Color(0xFF1f0a2e)];
          textColor = Colors.purple.shade200;
          break;
        case 'early_bird':
          borderColor = Colors.green.withValues(alpha: 0.35);
          gradientColors = [const Color(0xFF0c1c14), const Color(0xFF0a2e1d)];
          textColor = Colors.green.shade200;
          break;
        default:
          borderColor = const Color(0xFFC4C0FF).withValues(alpha: 0.25);
          gradientColors = [const Color(0xFF12121e), const Color(0xFF1a1a2e)];
          textColor = Colors.white;
          break;
      }
    }

    return Container(
      width: 120,
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: gradientColors,
        ),
        boxShadow: isUnlocked
            ? [
                BoxShadow(
                  color: textColor.withValues(alpha: 0.15),
                  blurRadius: 15,
                )
              ]
            : null,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            icon,
            style: TextStyle(
              fontSize: 24,
              color: isUnlocked ? null : Colors.grey.withValues(alpha: 0.3),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            title.toUpperCase(),
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.0,
              color: isUnlocked ? Colors.white : Colors.grey.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            desc.toUpperCase(),
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 7,
              fontWeight: FontWeight.w600,
              color: isUnlocked ? const Color(0xFF464555) : Colors.grey.withValues(alpha: 0.3),
            ),
          ),
        ],
      ),
    );
  }
}
