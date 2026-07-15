import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../state/providers/database_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models/target.dart';
import '../../core/services/haptic_service.dart';

class TargetsScreen extends ConsumerStatefulWidget {
  const TargetsScreen({super.key});

  @override
  ConsumerState<TargetsScreen> createState() => _TargetsScreenState();
}

class _TargetsScreenState extends ConsumerState<TargetsScreen> {
  String? _activeTargetId;
  final _titleController = TextEditingController();
  final _daysController = TextEditingController(text: '30');
  final _planController = TextEditingController();
  TargetCategory _selectedCategory = TargetCategory.learning;

  static const _categoryEmojis = {
    TargetCategory.learning: '🧠',
    TargetCategory.fitness: '💪',
    TargetCategory.career: '🚀',
    TargetCategory.creative: '🎨',
    TargetCategory.discipline: '⚔️',
    TargetCategory.custom: '🎯',
  };

  @override
  void dispose() {
    _titleController.dispose();
    _daysController.dispose();
    _planController.dispose();
    super.dispose();
  }

  int _calculateCurrentDay(TargetModel target) {
    final start = DateTime.parse(target.startDate);
    final now = DateTime.now();
    final diff = now.difference(start).inDays;
    return diff + 1; // Day 1 on start date
  }

  void _showAddModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(builder: (context, setStateModal) {
          return Container(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            decoration: const BoxDecoration(
              color: Color(0xFF0A0A0A),
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border: Border(top: BorderSide(color: Colors.white10)),
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'INITIALIZE PROTOCOL',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  const Text('PROTOCOL DESIGNATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppColors.textMuted)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _titleController,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: 'e.g. Learn Machine Learning',
                      hintStyle: const TextStyle(color: AppColors.textMuted),
                      filled: true,
                      fillColor: const Color(0xFF111111),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white10)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('CATEGORY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppColors.textMuted)),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: const Color(0xFF111111),
                                border: Border.all(color: Colors.white10),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<TargetCategory>(
                                  value: _selectedCategory,
                                  dropdownColor: const Color(0xFF111111),
                                  isExpanded: true,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  items: TargetCategory.values.map((cat) {
                                    return DropdownMenuItem(
                                      value: cat,
                                      child: Text('${_categoryEmojis[cat]} ${cat.name.toUpperCase()}'),
                                    );
                                  }).toList(),
                                  onChanged: (v) {
                                    if (v != null) setStateModal(() => _selectedCategory = v);
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('DURATION (DAYS)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppColors.textMuted)),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _daysController,
                              keyboardType: TextInputType.number,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: const Color(0xFF111111),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white10)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        _submitNewTarget();
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.brand,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('INITIALIZE PROTOCOL', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 2.0)),
                    ),
                  ),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  void _submitNewTarget() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) return;
    
    // Simplification for Flutter app: we don't implement the full plan generation in this function, 
    // we use the provider's `addTarget` or manually push. 
    // In db provider `addTarget` just makes a 30 day empty plan.
    // Let's call the provider method and it handles creation.
    await addTarget(ref, title);
    _titleController.clear();
  }

  void _toggleStep(TargetModel target, DayStep step) async {
    ref.read(hapticServiceProvider).selection();
    final db = ref.read(firestoreProvider);
    final isCompleted = target.completedDays.contains(step.day - 1); // 0-indexed internally? 
    // Wait, let's see how `TargetModel` is structured. 
    // In web `target.completedDays` stores indexes. Let's do the same.
    final idx = step.day - 1;
    List<int> updatedDays = List.from(target.completedDays);
    if (isCompleted) {
      updatedDays.remove(idx);
    } else {
      updatedDays.add(idx);
    }

    // Update step in plan
    List<DayStep> updatedPlan = List.from(target.plan);
    if (idx < updatedPlan.length) {
      updatedPlan[idx] = step.copyWith(
        isCompleted: !isCompleted,
        completedAt: !isCompleted ? DateTime.now().millisecondsSinceEpoch : null,
      );
    }

    await db.collection('users').doc(target.userId).collection('targets').doc(target.id).update({
      'completedDays': updatedDays,
      'plan': updatedPlan.map((s) => s.toJson()).toList(),
    });
  }

  @override
  Widget build(BuildContext context) {
    final targetsAsyncValue = ref.watch(targetsProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = constraints.maxWidth > 800;

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: targetsAsyncValue.when(
                  data: (targets) {
                    if (targets.isEmpty) return _buildEmptyState();

                    // Find active target
                    final activeTarget = targets.firstWhere(
                      (t) => t.id == _activeTargetId,
                      orElse: () => targets.first,
                    );

                    // Ensure selected if not
                    if (_activeTargetId == null && targets.isNotEmpty) {
                      Future.microtask(() => setState(() => _activeTargetId = targets.first.id));
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'TARGETS',
                          style: TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                            color: Color(0xFFE2E2E2),
                          ),
                        ),
                        const SizedBox(height: 32),
                        
                        // Mobile target selector
                        if (!isDesktop)
                          SizedBox(
                            height: 40,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: targets.length + 1,
                              itemBuilder: (context, idx) {
                                if (idx == targets.length) {
                                  return Padding(
                                    padding: const EdgeInsets.only(left: 8.0),
                                    child: ActionChip(
                                      label: const Row(
                                        children: [
                                          Icon(Icons.add, size: 14, color: AppColors.textMuted),
                                          SizedBox(width: 4),
                                          Text('NEW', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                                        ],
                                      ),
                                      backgroundColor: Colors.transparent,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(20),
                                        side: const BorderSide(color: Colors.white10),
                                      ),
                                      onPressed: _showAddModal,
                                    ),
                                  );
                                }
                                final t = targets[idx];
                                final isActive = t.id == activeTarget.id;
                                return Padding(
                                  padding: const EdgeInsets.only(right: 8.0),
                                  child: ChoiceChip(
                                    label: Row(
                                      children: [
                                        Text(_categoryEmojis[t.category] ?? '🎯'),
                                        const SizedBox(width: 4),
                                        Text(t.title),
                                      ],
                                    ),
                                    selected: isActive,
                                    onSelected: (_) => setState(() => _activeTargetId = t.id),
                                    backgroundColor: const Color(0xFF0A0A0A),
                                    selectedColor: AppColors.brand.withValues(alpha: 0.2),
                                    labelStyle: TextStyle(
                                      color: isActive ? Colors.white : AppColors.textMuted,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      side: BorderSide(color: isActive ? AppColors.brand : Colors.white10),
                                    ),
                                    showCheckmark: false,
                                  ),
                                );
                              },
                            ),
                          ),
                        if (!isDesktop) const SizedBox(height: 24),

                        Flex(
                          direction: isDesktop ? Axis.horizontal : Axis.vertical,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: isDesktop ? 8 : 0,
                              child: _buildLeftColumn(activeTarget),
                            ),
                            if (isDesktop) const SizedBox(width: 32),
                            if (!isDesktop) const SizedBox(height: 24),
                            Expanded(
                              flex: isDesktop ? 4 : 0,
                              child: _buildRightColumn(activeTarget, targets, isDesktop),
                            ),
                          ],
                        ),
                      ],
                    );
                  },
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, s) => Center(child: Text('Error: $e', style: const TextStyle(color: Colors.red))),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      margin: const EdgeInsets.only(top: 48),
      padding: const EdgeInsets.all(48),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.brand.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.brand.withValues(alpha: 0.2)),
            ),
            child: const Icon(Icons.flag, size: 48, color: AppColors.brand),
          ),
          const SizedBox(height: 24),
          const Text(
            'NO ACTIVE INITIATIVES',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              letterSpacing: 2.0,
              color: Color(0xFFE2E2E2),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Deploy a new targeted learning protocol and auto-track your mission progress day-by-day.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textMuted),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _showAddModal,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.brand,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('INITIALIZE PROTOCOL', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5)),
          ),
        ],
      ),
    );
  }

  Widget _buildLeftColumn(TargetModel target) {
    final currentDay = _calculateCurrentDay(target);
    final todayIndex = currentDay - 1;
    DayStep? todayStep;
    if (todayIndex >= 0 && todayIndex < target.plan.length) {
      todayStep = target.plan[todayIndex];
    } else if (target.plan.isEmpty) {
      todayStep = DayStep(day: currentDay, title: 'Focus on ${target.title}', description: 'Execute mission parameters.');
    }

    final isPastEnd = currentDay > target.totalDays;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (todayStep != null && !isPastEnd)
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF0A0A0A), Color(0xFF14141A)],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.brand.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.brand.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('CURRENT DIRECTIVE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: Color(0xFFC4C0FF))),
                    ),
                    const SizedBox(width: 8),
                    Text('DAY ${todayStep.day} OF ${target.totalDays}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2.0, color: AppColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 16),
                Text(todayStep.title, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 8),
                Text(todayStep.description, style: const TextStyle(color: AppColors.textMuted)),
                const SizedBox(height: 24),
                
                GestureDetector(
                  onTap: () => _toggleStep(target, todayStep!),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    decoration: BoxDecoration(
                      color: todayStep.isCompleted ? const Color(0xFF111111) : const Color(0xFFE2E2E2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: todayStep.isCompleted ? Colors.white10 : Colors.transparent),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          todayStep.isCompleted ? Icons.done_all : Icons.bolt,
                          color: todayStep.isCompleted ? AppColors.textMuted : Colors.black,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          todayStep.isCompleted ? 'DIRECTIVE COMPLETED' : 'EXECUTE DIRECTIVE',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: todayStep.isCompleted ? AppColors.textMuted : Colors.black,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        
        const SizedBox(height: 32),
        const Text('TIMELINE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppColors.textMuted)),
        const SizedBox(height: 16),
        
        // Render timeline
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: target.plan.isNotEmpty ? target.plan.length : target.totalDays,
          itemBuilder: (context, idx) {
            final isCompleted = target.completedDays.contains(idx);
            final isPast = idx < todayIndex;
            final isToday = idx == todayIndex;
            final isMissed = isPast && !isCompleted;

            DayStep step;
            if (idx < target.plan.length) {
              step = target.plan[idx];
            } else {
              step = DayStep(day: idx + 1, title: 'Focus on ${target.title}', description: '');
            }

            Color cardBg = const Color(0xFF0A0A0A);
            Color cardBorder = Colors.white.withValues(alpha: 0.05);
            Color iconColor = AppColors.textMuted;
            IconData iconData = Icons.radio_button_unchecked;
            Color titleColor = const Color(0xFFE2E2E2);

            if (isCompleted) {
              cardBg = const Color(0xFF050505);
              titleColor = AppColors.textMuted;
              iconColor = AppColors.brand;
              iconData = Icons.check_circle;
            } else if (isToday) {
              cardBg = const Color(0xFF111111);
              cardBorder = AppColors.brand.withValues(alpha: 0.4);
              iconColor = AppColors.brand;
              iconData = Icons.radio_button_checked;
            } else if (isMissed) {
              cardBg = Colors.red.withValues(alpha: 0.05);
              cardBorder = Colors.red.withValues(alpha: 0.2);
              iconColor = Colors.red.withValues(alpha: 0.5);
              iconData = Icons.cancel;
            }

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cardBg,
                border: Border.all(color: cardBorder),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(iconData, color: iconColor, size: 20),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DAY ${step.day}',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                            color: isToday ? AppColors.brand : (isMissed ? Colors.redAccent : AppColors.textMuted),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          step.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: titleColor,
                            decoration: isCompleted ? TextDecoration.lineThrough : null,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isToday)
                    IconButton(
                      onPressed: () => _toggleStep(target, step),
                      icon: Icon(isCompleted ? Icons.undo : Icons.done, color: AppColors.textMuted),
                    ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildRightColumn(TargetModel target, List<TargetModel> allTargets, bool isDesktop) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isDesktop) ...[
          const Text('ACTIVE PROTOCOLS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppColors.textMuted)),
          const SizedBox(height: 8),
          ...allTargets.map((t) {
            final isActive = t.id == target.id;
            return GestureDetector(
              onTap: () => setState(() => _activeTargetId = t.id),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.brand.withValues(alpha: 0.2) : const Color(0xFF0A0A0A),
                  border: Border.all(color: isActive ? AppColors.brand : Colors.white10),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Text(_categoryEmojis[t.category] ?? '🎯'),
                    const SizedBox(width: 12),
                    Expanded(child: Text(t.title, style: TextStyle(color: isActive ? Colors.white : AppColors.textMuted, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.0))),
                    Icon(Icons.arrow_forward_ios, size: 12, color: isActive ? Colors.white : AppColors.textMuted),
                  ],
                ),
              ),
            );
          }),
          GestureDetector(
            onTap: _showAddModal,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white10, style: BorderStyle.none), // dashed in web, standard border here for simplicity
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.add, size: 16, color: AppColors.textMuted),
                  SizedBox(width: 12),
                  Text('INITIALIZE PROTOCOL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: AppColors.textMuted)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],

        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF0A0A0A),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('EXECUTION MATRIX', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2.0, color: Colors.white)),
              const SizedBox(height: 4),
              Text('${target.completedDays.length} / ${target.totalDays} DAYS CAPTURED', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: AppColors.textMuted)),
              const SizedBox(height: 24),
              
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: List.generate(target.totalDays, (idx) {
                  final isCompleted = target.completedDays.contains(idx);
                  final isToday = idx == _calculateCurrentDay(target) - 1;
                  final isMissed = idx < (_calculateCurrentDay(target) - 1) && !isCompleted;

                  Color boxColor = const Color(0xFF1A1A1A);
                  if (isCompleted) {
                    boxColor = AppColors.brand;
                  } else if (isToday) {
                    boxColor = AppColors.brand.withValues(alpha: 0.3);
                  } else if (isMissed) {
                    boxColor = Colors.red.withValues(alpha: 0.2);
                  }

                  return Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: boxColor,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: isToday ? AppColors.brand : Colors.white10),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
