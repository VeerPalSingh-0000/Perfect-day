import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../state/providers/database_provider.dart';
import '../../data/models/day_record.dart';
import '../../core/theme/app_colors.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  int _selectedMonth = DateTime.now().month;
  int _selectedYear = DateTime.now().year;
  String? _expandedDate;

  String _formatMinutes(num mins) {
    if (mins >= 60) {
      return '${(mins / 60).floor()}h ${(mins % 60).round()}m';
    }
    return '${mins.round()}m';
  }

  @override
  Widget build(BuildContext context) {
    final recordsAsync = ref.watch(dayRecordsProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: recordsAsync.when(
        data: (records) {
          // Compute available months
          final availableMonths = _computeAvailableMonths(records);
          final filteredRecords = records.where((r) {
            final parts = r.date.split('-');
            final y = int.parse(parts[0]);
            final m = int.parse(parts[1]);
            return y == _selectedYear && m == _selectedMonth;
          }).toList();

          return LayoutBuilder(
            builder: (context, constraints) {
              final isDesktop = constraints.maxWidth > 800;

              return SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1200),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'History',
                          style: TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -1.0,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'PERFORMANCE LOG',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 2.0,
                            color: AppColors.textMuted,
                          ),
                        ),
                        const SizedBox(height: 32),
                        Flex(
                          direction: isDesktop ? Axis.horizontal : Axis.vertical,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Left Column (Month Selector)
                            if (isDesktop)
                              Expanded(
                                flex: 3,
                                child: _buildDesktopMonthSelector(availableMonths),
                              )
                            else
                              _buildMobileMonthSelector(availableMonths),
                            
                            if (isDesktop) const SizedBox(width: 32),
                            if (!isDesktop) const SizedBox(height: 24),
                            
                            // Right Column (Daily Logs)
                            Expanded(
                              flex: isDesktop ? 9 : 0,
                              child: _buildDailyLogs(filteredRecords),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
      ),
    );
  }

  List<Map<String, dynamic>> _computeAvailableMonths(List<DayRecordModel> records) {
    final map = <String, Map<String, dynamic>>{};
    if (records.isEmpty) {
      final d = DateTime.now();
      return [
        {
          'month': d.month,
          'year': d.year,
          'label': DateFormat('MMM').format(d),
        }
      ];
    }

    for (final r in records) {
      final parts = r.date.split('-');
      final y = parts[0];
      final m = parts[1];
      final key = '$y-$m';
      if (!map.containsKey(key)) {
        final d = DateTime(int.parse(y), int.parse(m), 1);
        map[key] = {
          'month': int.parse(m),
          'year': int.parse(y),
          'label': DateFormat('MMM').format(d),
        };
      }
    }
    return map.values.toList().reversed.toList();
  }

  Widget _buildMobileMonthSelector(List<Map<String, dynamic>> months) {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: months.length,
        itemBuilder: (context, index) {
          final m = months[index];
          final isActive = m['month'] == _selectedMonth && m['year'] == _selectedYear;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(m['label']),
              selected: isActive,
              onSelected: (val) {
                setState(() {
                  _selectedMonth = m['month'];
                  _selectedYear = m['year'];
                });
              },
              backgroundColor: Colors.transparent,
              selectedColor: Colors.white,
              labelStyle: TextStyle(
                color: isActive ? Colors.black : AppColors.textMuted,
                fontWeight: isActive ? FontWeight.w900 : FontWeight.bold,
                fontSize: 10,
                letterSpacing: 2.0,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isActive ? Colors.transparent : AppColors.textMuted.withValues(alpha: 0.3),
                ),
              ),
              showCheckmark: false,
            ),
          );
        },
      ),
    );
  }

  Widget _buildDesktopMonthSelector(List<Map<String, dynamic>> months) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Text(
            'SELECT JOURNEY PERIOD',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              color: AppColors.textMuted,
            ),
          ),
        ),
        ...months.map((m) {
          final isActive = m['month'] == _selectedMonth && m['year'] == _selectedYear;
          return InkWell(
            onTap: () {
              setState(() {
                _selectedMonth = m['month'];
                _selectedYear = m['year'];
              });
            },
            borderRadius: BorderRadius.circular(12),
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isActive ? Colors.white : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isActive ? Colors.transparent : AppColors.textMuted.withValues(alpha: 0.15),
                ),
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: Colors.white.withValues(alpha: 0.1),
                          blurRadius: 15,
                        )
                      ]
                    : null,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${m['label']} ${m['year']}'.toUpperCase(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isActive ? FontWeight.w900 : FontWeight.bold,
                      letterSpacing: 2.0,
                      color: isActive ? Colors.black : AppColors.textSecondary,
                    ),
                  ),
                  if (isActive)
                    const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.black),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildDailyLogs(List<DayRecordModel> records) {
    if (records.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: const Color(0xFF0E0E0E),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.textMuted.withValues(alpha: 0.15)),
        ),
        alignment: Alignment.center,
        child: const Text(
          'No data recorded for this month.',
          style: TextStyle(
            color: AppColors.textMuted,
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
        ),
      );
    }

    return Column(
      children: records.map((record) => _buildDayCard(record)).toList(),
    );
  }

  Widget _buildDayCard(DayRecordModel record) {
    final parts = record.date.split('-');
    final dateObj = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
    final dayNumStr = dateObj.day.toString().padLeft(2, '0');
    final dayNameStr = DateFormat('EEE').format(dateObj).toUpperCase();
    final isExpanded = _expandedDate == record.date;

    String ratingLabel = 'Neutral';
    Color textColor = AppColors.textMuted;
    Color circleColor = AppColors.textMuted;
    Color borderColor = AppColors.textMuted.withValues(alpha: 0.15);
    Color bgColor = const Color(0xFF0E0E0E);
    List<BoxShadow>? shadows;

    if (record.rating == DayRating.perfect) {
      ratingLabel = 'Perfect Day';
      textColor = Colors.white;
      circleColor = const Color(0xFFE2E2E2);
      borderColor = Colors.white.withValues(alpha: 0.05);
    } else if (record.rating == DayRating.great) {
      ratingLabel = 'High Output';
      textColor = Colors.white;
      circleColor = AppColors.brand;
      if (isExpanded) {
        borderColor = Colors.white.withValues(alpha: 0.10);
        shadows = [
          BoxShadow(
            color: AppColors.brand.withValues(alpha: 0.15),
            blurRadius: 20,
          )
        ];
      } else {
        borderColor = Colors.white.withValues(alpha: 0.05);
      }
    } else if (record.rating == DayRating.good) {
      ratingLabel = 'Standard';
    } else if (record.rating == DayRating.okay) {
      ratingLabel = 'Moderate';
    } else {
      ratingLabel = 'Light';
    }

    return GestureDetector(
      onTap: () {
        setState(() {
          _expandedDate = isExpanded ? null : record.date;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: borderColor),
          boxShadow: shadows,
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${DateFormat('MMM').format(dateObj)} $dayNumStr',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFE2E2E2),
                          ),
                        ),
                        Text(
                          dayNameStr,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2.0,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      height: 40,
                      width: 1,
                      color: AppColors.textMuted.withValues(alpha: 0.2),
                      margin: const EdgeInsets.symmetric(horizontal: 24),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          ratingLabel.toUpperCase(),
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                            color: textColor,
                          ),
                        ),
                        Text(
                          '${record.completedTasks}/${record.totalTasks} Task Clearance'.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2.0,
                            color: AppColors.textMuted,
                          ),
                        ),
                        if ((record.totalFocusTime ?? 0) > 0)
                          Padding(
                            padding: const EdgeInsets.only(top: 4.0),
                            child: Row(
                              children: [
                                const Icon(Icons.timer, size: 12, color: AppColors.brand),
                                const SizedBox(width: 4),
                                Text(
                                  '${_formatMinutes(record.totalFocusTime ?? 0)} Focus'.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 2.0,
                                    color: AppColors.brand,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
                SizedBox(
                  width: isExpanded ? 56 : 48,
                  height: isExpanded ? 56 : 48,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      CircularProgressIndicator(
                        value: 1.0,
                        color: AppColors.textMuted.withValues(alpha: 0.2),
                        strokeWidth: 2,
                      ),
                      CircularProgressIndicator(
                        value: record.completionPercentage / 100,
                        color: circleColor,
                        strokeWidth: 2,
                        strokeCap: StrokeCap.round,
                      ),
                      Text(
                        '${record.completionPercentage.round()}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: textColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (isExpanded && record.tasks.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 24.0),
                child: Container(
                  padding: const EdgeInsets.only(top: 24.0),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: AppColors.textMuted.withValues(alpha: 0.15),
                      ),
                    ),
                  ),
                  child: Column(
                    children: record.tasks.map((task) {
                      final done = task.isCompleted;
                      final timeStr = done && task.completedAt != null
                          ? DateFormat('HH:mm').format(DateTime.fromMillisecondsSinceEpoch(task.completedAt!))
                          : (!done ? 'MISS' : 'DONE');

                      return Opacity(
                        opacity: done ? 1.0 : 0.4,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 16.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 20,
                                    height: 20,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: done ? AppColors.brand : AppColors.textMuted,
                                      ),
                                    ),
                                    child: done
                                        ? const Icon(Icons.check, size: 12, color: AppColors.brand)
                                        : null,
                                  ),
                                  const SizedBox(width: 16),
                                  Text(
                                    task.title,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: done ? const Color(0xFFE2E2E2) : AppColors.textMuted,
                                      decoration: done ? null : TextDecoration.lineThrough,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                timeStr,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2.0,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
