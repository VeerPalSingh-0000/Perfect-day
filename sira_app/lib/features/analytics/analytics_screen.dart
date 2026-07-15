import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../state/providers/database_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models/day_record.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  DateTime _currentMonthDate = DateTime.now();
  DayRecordModel? _selectedDayRecord;

  @override
  Widget build(BuildContext context) {
    final recordsAsync = ref.watch(dayRecordsProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: recordsAsync.when(
        data: (records) {
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
                        // Share Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'INSIGHTS',
                                  style: TextStyle(
                                    fontFamily: 'Plus Jakarta Sans',
                                    fontSize: 28,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: -0.5,
                                    color: Color(0xFFE2E2E2),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'YOUR PERFORMANCE LANDSCAPE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 2.0,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.share, size: 14),
                              label: const Text('SHARE SUCCESS'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFC4C0FF).withValues(alpha: 0.1),
                                foregroundColor: const Color(0xFFC4C0FF),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  side: BorderSide(color: const Color(0xFFC4C0FF).withValues(alpha: 0.2)),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),

                        Flex(
                          direction: isDesktop ? Axis.horizontal : Axis.vertical,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: isDesktop ? 8 : 0,
                              child: _buildLeftColumn(records),
                            ),
                            if (isDesktop) const SizedBox(width: 32),
                            if (!isDesktop) const SizedBox(height: 24),
                            Expanded(
                              flex: isDesktop ? 4 : 0,
                              child: _buildRightColumn(records),
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

  Widget _buildLeftColumn(List<DayRecordModel> records) {
    // Basic Calculations
    final today = DateTime.now();
    final todayStr = DateFormat('yyyy-MM-dd').format(today);
    
    int totalTasksDone = records.fold(0, (sum, r) => sum + r.completedTasks);
    int perfectDays = records.where((r) => r.completionPercentage == 100).length;
    int avgCompletion = records.isEmpty ? 0 : (records.fold(0, (sum, r) => sum + r.completionPercentage) / records.length).round();

    // Streak Calculation (Simplified for UI view)
    int currentStreak = 0;
    int longestStreak = 0;
    DateTime checkDate = today;
    bool checking = true;

    // A more thorough streak check similar to React
    if (!records.any((r) => r.date == todayStr && r.completionPercentage >= 80)) {
      checkDate = checkDate.subtract(const Duration(days: 1));
    }
    while (checking) {
      final dStr = DateFormat('yyyy-MM-dd').format(checkDate);
      final rec = records.where((r) => r.date == dStr).firstOrNull;
      if (rec != null && rec.completionPercentage >= 80) {
        currentStreak++;
        checkDate = checkDate.subtract(const Duration(days: 1));
      } else {
        checking = false;
      }
    }

    final sortedDates = records.map((r) => r.date).toSet().toList()..sort();
    int temp = 0;
    DateTime? lastDate;
    for (final dStr in sortedDates) {
      final rec = records.where((r) => r.date == dStr).firstOrNull;
      if (rec != null && rec.completionPercentage >= 80) {
        final d = DateTime.parse(dStr);
        if (lastDate != null) {
          final diff = d.difference(lastDate).inDays;
          if (diff == 1) {
            temp++;
          } else {
            temp = 1;
          }
        } else {
          temp = 1;
        }
        if (temp > longestStreak) longestStreak = temp;
        lastDate = d;
      } else {
        temp = 0;
        lastDate = null;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 2x2 Core Stats Grid
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 2.0,
          children: [
            _buildStatCard(avgCompletion.toString(), '%', 'Avg. Completion', Icons.trending_up, isUp: true),
            _buildStatCard(currentStreak.toString(), ' / $longestStreak', 'Streak (Current / Best)', Icons.local_fire_department),
            _buildStatCard(perfectDays.toString(), '', 'Perfect Days', Icons.star),
            _buildStatCard(totalTasksDone.toString(), '', 'Total Tasks Done', Icons.task_alt),
          ],
        ),
        const SizedBox(height: 32),
        
        // Weekly Chart
        _buildWeeklyChart(records, today),
        const SizedBox(height: 32),

        // Monthly Heatmap
        _buildMonthlyHeatmap(records),
      ],
    );
  }

  Widget _buildStatCard(String value, String suffix, String label, IconData icon, {bool? isUp}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0E0E0E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 15)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFFE2E2E2))),
                  if (suffix.isNotEmpty) Text(suffix, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                ],
              ),
              Icon(icon, size: 20, color: AppColors.textMuted.withValues(alpha: 0.5)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: AppColors.textMuted)),
              if (isUp != null)
                Text(
                  '${isUp ? "↑" : "↓"} vs last month',
                  style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: isUp ? const Color(0xFFC4C0FF) : AppColors.textMuted),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWeeklyChart(List<DayRecordModel> records, DateTime today) {
    final last7Days = List.generate(7, (i) => today.subtract(Duration(days: 6 - i)));
    final weeklyData = last7Days.map((date) {
      final dStr = DateFormat('yyyy-MM-dd').format(date);
      final rec = records.where((r) => r.date == dStr).firstOrNull;
      return {
        'date': date,
        'dayShort': DateFormat('E').format(date).toUpperCase(),
        'completion': rec?.completionPercentage ?? 0,
      };
    }).toList();

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0E0E0E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('WEEKLY COMPLETION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Colors.white)),
                  Text('↑ 12% vs last week', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: const Color(0xFFC4C0FF))),
                ],
              ),
              Text(
                '${DateFormat('MMM dd').format(last7Days.first)} - ${DateFormat('MMM dd').format(last7Days.last)}',
                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: weeklyData.map((d) {
              final completion = d['completion'] as int;
              return Column(
                children: [
                  Container(
                    height: 120,
                    width: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFF111111),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    alignment: Alignment.bottomCenter,
                    child: Container(
                      height: 120 * (completion / 100),
                      width: 32,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        boxShadow: [BoxShadow(color: Colors.white.withValues(alpha: 0.1), blurRadius: 15)],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(d['dayShort'] as String, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildMonthlyHeatmap(List<DayRecordModel> records) {
    final year = _currentMonthDate.year;
    final month = _currentMonthDate.month;
    final firstDay = DateTime(year, month, 1);
    final daysInMonth = DateTime(year, month + 1, 0).day;

    final calendarDays = <DateTime?>[];
    for (int i = 0; i < firstDay.weekday % 7; i++) {
      calendarDays.add(null);
    }
    for (int i = 1; i <= daysInMonth; i++) {
      calendarDays.add(DateTime(year, month, i));
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0E0E0E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                DateFormat('MMMM yyyy').format(_currentMonthDate).toUpperCase(),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Colors.white),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left, color: Colors.white),
                    onPressed: () => setState(() => _currentMonthDate = DateTime(year, month - 1, 1)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right, color: Colors.white),
                    onPressed: () => setState(() => _currentMonthDate = DateTime(year, month + 1, 1)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 1.0,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: 7 + calendarDays.length,
            itemBuilder: (context, index) {
              if (index < 7) {
                final days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                return Center(child: Text(days[index], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted)));
              }
              final dateObj = calendarDays[index - 7];
              if (dateObj == null) return const SizedBox();

              final dStr = DateFormat('yyyy-MM-dd').format(dateObj);
              final rec = records.where((r) => r.date == dStr).firstOrNull;
              
              Color color = const Color(0xFF111111);
              if (rec != null) {
                if (rec.rating == DayRating.perfect) {
                  color = const Color(0xFF7cf6ec);
                } else if (rec.rating == DayRating.great) {
                  color = const Color(0xFFC4C0FF);
                } else if (rec.rating == DayRating.good) {
                  color = const Color(0xFF4F44E2);
                } else if (rec.rating == DayRating.okay) {
                  color = const Color(0xFFFFB86C);
                } else {
                  color = const Color(0xFF464555);
                }
              }
              
              final isToday = dStr == DateFormat('yyyy-MM-dd').format(DateTime.now());

              return GestureDetector(
                onTap: () {
                  if (rec != null) setState(() => _selectedDayRecord = rec);
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(4),
                    border: isToday ? Border.all(color: Colors.white.withValues(alpha: 0.3), width: 1.5) : null,
                  ),
                ),
              );
            },
          ),
          if (_selectedDayRecord != null) ...[
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111111).withValues(alpha: 0.8),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('SELECTED AUDIT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: AppColors.textMuted)),
                          Text(DateFormat('MMMM d, yyyy').format(DateTime.parse(_selectedDayRecord!.date)), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppColors.textMuted),
                        onPressed: () => setState(() => _selectedDayRecord = null),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ..._selectedDayRecord!.tasks.map((t) => Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Row(
                      children: [
                        Icon(t.isCompleted ? Icons.check_circle : Icons.radio_button_unchecked, size: 16, color: t.isCompleted ? Colors.white : AppColors.textMuted),
                        const SizedBox(width: 8),
                        Text(t.title, style: TextStyle(fontSize: 12, color: t.isCompleted ? Colors.white : AppColors.textMuted, decoration: t.isCompleted ? null : TextDecoration.lineThrough)),
                      ],
                    ),
                  )),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRightColumn(List<DayRecordModel> records) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Weekly Report Summary
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF0E0E0E), Color(0xFF151515)],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('WEEKLY REPORT SUMMARY', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Color(0xFFC4C0FF))),
              const SizedBox(height: 24),
              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 2.5,
                children: [
                  _buildSummaryItem('Best Day', 'TUE • 100%'),
                  _buildSummaryItem('Top Habit', 'MEDITATION'),
                  _buildSummaryItem('Weekly Delta', '+12% vs last week'),
                  _buildSummaryItem('Performance', 'CONSISTENT'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Category Allocation
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF0E0E0E),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('CATEGORY ALLOCATION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Colors.white)),
              const SizedBox(height: 24),
              _buildCategoryRow('LEARNING', 45, const Color(0xFFE2E2E2)),
              _buildCategoryRow('FITNESS', 25, const Color(0xFFC4C0FF)),
              _buildCategoryRow('WORK', 20, const Color(0xFF4F44E2)),
              _buildCategoryRow('OTHER', 10, const Color(0xFF464555)),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Day Ratings
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF0E0E0E),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('DAY RATINGS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Colors.white)),
                  const Text('Last 30 Days', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                height: 16,
                width: double.infinity,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), color: const Color(0xFF111111)),
                child: Row(
                  children: [
                    Expanded(flex: 3, child: Container(color: const Color(0xFF7cf6ec))),
                    Expanded(flex: 4, child: Container(color: const Color(0xFFC4C0FF))),
                    Expanded(flex: 2, child: Container(color: const Color(0xFF4F44E2))),
                    Expanded(flex: 1, child: Container(color: const Color(0xFFFFB86C))),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              GridView.count(
                crossAxisCount: 2,
                childAspectRatio: 5,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildRatingLegend('PERFECT (3)', const Color(0xFF7cf6ec)),
                  _buildRatingLegend('GREAT (4)', const Color(0xFFC4C0FF)),
                  _buildRatingLegend('GOOD (2)', const Color(0xFF4F44E2)),
                  _buildRatingLegend('OKAY (1)', const Color(0xFFFFB86C)),
                  _buildRatingLegend('ROUGH (0)', const Color(0xFF464555)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryItem(String title, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: AppColors.textMuted)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
      ],
    );
  }

  Widget _buildCategoryRow(String title, int percentage, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Colors.white)),
              Text('$percentage%', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 6,
            width: double.infinity,
            decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(3)),
            alignment: Alignment.centerLeft,
            child: Container(
              height: 6,
              width: percentage.toDouble() * 3, // Approximation
              decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingLegend(String title, Color color) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: color)),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: Colors.white)),
      ],
    );
  }
}
