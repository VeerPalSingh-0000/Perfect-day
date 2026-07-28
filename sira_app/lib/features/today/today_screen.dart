import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers/database_provider.dart';
import '../../state/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/stats_calculator.dart';
import '../../core/utils/habit_helper.dart';
import '../../data/models/day_record.dart';
import '../../data/models/task.dart';
import '../../core/services/haptic_service.dart';

import 'package:intl/intl.dart';
import 'widgets/focus_intention_input.dart';
import 'widgets/quote_card.dart';
import 'widgets/day_status_card.dart';
import 'widgets/metric_card.dart';
import 'widgets/task_list_item.dart';

void _seedMissingHabits(WidgetRef ref, List<TaskModel> allTasks, String todayStr) {
  final currentTodayTasks = allTasks.where((t) => t.date == todayStr).toList();
  final existingTitles = currentTodayTasks.map((t) => "${t.title}__${t.category.name}").toSet();

  final allHabits = allTasks.where((t) => t.isHabit && (t.isPaused != true)).toList();
  allHabits.sort((a, b) => b.date.compareTo(a.date));
  
  final uniqueHabits = <String, TaskModel>{};
  for (final h in allHabits) {
    final key = "${h.title}__${h.category.name}";
    if (!uniqueHabits.containsKey(key)) {
      uniqueHabits[key] = h;
    }
  }

  final newHabits = uniqueHabits.values.where((h) {
    if (existingTitles.contains("${h.title}__${h.category.name}")) return false;
    return HabitValidityHelper.isHabitValidForDate(h, todayStr);
  }).toList();

  if (newHabits.isNotEmpty) {
    final db = ref.read(firestoreProvider);
    final user = ref.read(authStateProvider).value;
    if (user != null) {
      final batch = db.batch();
      final tasksCollection = db.collection('users').doc(user.uid).collection('tasks');
      int orderOffset = currentTodayTasks.length;
      for (final h in newHabits) {
        final id = tasksCollection.doc().id;
        final newTask = TaskModel(
          id: id,
          userId: user.uid,
          title: h.title,
          category: h.category,
          isCompleted: false,
          isHabit: true,
          date: todayStr,
          order: orderOffset++,
          createdAt: DateTime.now().millisecondsSinceEpoch,
          frequency: h.frequency,
          priority: h.priority,
          targetTime: h.targetTime,
          linkedTrackItIds: h.linkedTrackItIds,
        );
        batch.set(tasksCollection.doc(id), newTask.toJson());
      }
      batch.commit().catchError((e) => debugPrint('Error seeding habits: $e'));
    }
  }
}

class TodayScreen extends ConsumerWidget {
  const TodayScreen({super.key});

  int _calculateStreak(List<DayRecordModel> records, int todayPercentage) {
    int streak = 0;
    final today = DateTime.now();
    final checkDate = DateTime(today.year, today.month, today.day).subtract(const Duration(days: 1));

    bool checking = true;
    DateTime currentCheck = checkDate;
    while (checking) {
      final dateStr = "${currentCheck.year}-${currentCheck.month.toString().padLeft(2, '0')}-${currentCheck.day.toString().padLeft(2, '0')}";
      final recordIndex = records.indexWhere((r) => r.date == dateStr);
      if (recordIndex != -1 && records[recordIndex].completionPercentage >= 80) {
        streak++;
        currentCheck = currentCheck.subtract(const Duration(days: 1));
      } else {
        checking = false;
      }
    }
    return todayPercentage >= 80 ? streak + 1 : streak;
  }

  int _calculatePerfectDays(List<DayRecordModel> records, int todayPercentage) {
    int perfect = records.where((r) => r.completionPercentage == 100).length;
    return todayPercentage == 100 ? perfect + 1 : perfect;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksAsyncValue = ref.watch(tasksProvider);
    final recordsAsyncValue = ref.watch(dayRecordsProvider);
    final authState = ref.watch(authStateProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: authState.when(
        data: (user) {
          if (user == null) {
            return Center(
              child: ElevatedButton(
                onPressed: () => signInAnonymously(ref),
                child: const Text('Sign In Anonymously (Dev)'),
              ),
            );
          }
          return tasksAsyncValue.when(
            data: (allTasks) {
              final todayStr = StatsCalculator.getTodayDateString();
              
              WidgetsBinding.instance.addPostFrameCallback((_) {
                _seedMissingHabits(ref, allTasks, todayStr);
              });

              final tasks = allTasks.where((t) {
                return t.date == todayStr;
              }).toList();

              final totalTasks = tasks.length;
              final completedTasks = tasks.where((t) => t.isCompleted).length;
              final completionPercentage = StatsCalculator.calculateCompletionPercentage(tasks.cast());
              final rating = StatsCalculator.calculateDayRating(totalTasks == 0 ? 0 : completionPercentage);
              final ratingInfo = StatsCalculator.getRatingDetails(totalTasks == 0 ? "none" : rating);

              return recordsAsyncValue.when(
                data: (records) {
                  final streak = _calculateStreak(records, totalTasks == 0 ? 0 : completionPercentage);
                  final perfectDays = _calculatePerfectDays(records, totalTasks == 0 ? 0 : completionPercentage);

                  return CustomScrollView(
                    slivers: [
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                        sliver: SliverList(
                          delegate: SliverChildListDelegate([
                            // Greeting
                            Text(
                              '${StatsCalculator.getTimeBasedGreeting()}, ${user.displayName?.split(" ")[0] ?? "User"}',
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -1,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              DateFormat('EEEE, MMMM d').format(DateTime.now()).toUpperCase(),
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2.0,
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: 32),

                            // Focus Intention
                            const FocusIntentionInput(),
                            const SizedBox(height: 32),

                            // Quote
                            const QuoteOfTheDay(quote: "Your mind is for having ideas, not holding them. — David Allen"),
                            const SizedBox(height: 32),

                            // Mobile Day Status Dashboard
                            DayStatusCard(
                              emoji: ratingInfo['emoji'] as String,
                              label: ratingInfo['label'] as String,
                              completedTasks: completedTasks,
                              totalTasks: totalTasks,
                              completionPercentage: completionPercentage,
                            ),
                            const SizedBox(height: 16),

                            // Mobile Streak & Perfect Days
                            MetricCard(
                              value: streak,
                              label: "Day Streak",
                              icon: Icons.local_fire_department,
                              activeColor: const Color(0xFFF97316), // orange
                            ),
                            const SizedBox(height: 16),
                            MetricCard(
                              value: perfectDays,
                              label: "Perfect Days",
                              icon: Icons.star,
                              activeColor: AppColors.info,
                            ),
                            const SizedBox(height: 32),

                            // Tasks Header
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Tasks',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            
                            // Full-width New Task button
                            OutlinedButton(
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (context) => _AddTaskModal(ref: ref),
                                );
                              },
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                backgroundColor: AppColors.brand.withValues(alpha: 0.1),
                                side: BorderSide(color: AppColors.brand.withValues(alpha: 0.45)),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(30),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.add, color: AppColors.brandLight, size: 20),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'New Task',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.brandLight,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            
                            // Task List
                            if (tasks.isEmpty)
                              Container(
                                padding: const EdgeInsets.symmetric(vertical: 40),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0A0A0A),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.border.withValues(alpha: 0.15)),
                                ),
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.fact_check,
                                      size: 40,
                                      color: AppColors.textMuted.withValues(alpha: 0.8),
                                    ),
                                    const SizedBox(height: 8),
                                    const Text(
                                      'Your day is a blank canvas.',
                                      style: TextStyle(
                                        color: AppColors.textSecondary,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const Text(
                                      'Add tasks above to start planning.',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            else
                              ...tasks.map((task) => TaskListItem(
                                    task: task,
                                    onToggle: () {
                                      ref.read(hapticServiceProvider).selection();
                                      toggleTask(ref, task, !task.isCompleted);
                                    },
                                    onEdit: () {
                                      // TODO: Open modal with task
                                    },
                                    onDelete: () {
                                      ref.read(hapticServiceProvider).medium();
                                      deleteTask(ref, task.id);
                                    },
                                  )),
                          ]),
                        ),
                      ),
                    ],
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (err, stack) => Center(child: Text('Error: $err')),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('Error: $err')),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Auth Error: $err')),
      ),
    );
  }
}

class _AddTaskModal extends StatefulWidget {
  final WidgetRef ref;
  const _AddTaskModal({required this.ref});

  @override
  State<_AddTaskModal> createState() => _AddTaskModalState();
}

class _AddTaskModalState extends State<_AddTaskModal> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit() {
    final title = _controller.text.trim();
    if (title.isNotEmpty) {
      addTask(widget.ref, title);
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Add new task',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _controller,
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'What needs to be done?',
              ),
              onSubmitted: (_) => _submit(),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                child: const Text('Add Task'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
