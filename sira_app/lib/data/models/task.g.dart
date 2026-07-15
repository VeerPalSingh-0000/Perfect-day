// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_TaskModel _$TaskModelFromJson(Map<String, dynamic> json) => _TaskModel(
  id: json['id'] as String,
  userId: json['userId'] as String,
  title: json['title'] as String,
  category: $enumDecode(_$TaskCategoryEnumMap, json['category']),
  isCompleted: json['isCompleted'] as bool? ?? false,
  isHabit: json['isHabit'] as bool? ?? false,
  isPaused: json['isPaused'] as bool?,
  frequency: $enumDecodeNullable(_$HabitFrequencyEnumMap, json['frequency']),
  priority: $enumDecodeNullable(_$TaskPriorityEnumMap, json['priority']),
  targetTime: (json['targetTime'] as num?)?.toInt(),
  timeSpent: (json['timeSpent'] as num?)?.toInt(),
  isRunning: json['isRunning'] as bool?,
  lastStartedAt: (json['lastStartedAt'] as num?)?.toInt(),
  date: json['date'] as String,
  order: (json['order'] as num).toInt(),
  createdAt: (json['createdAt'] as num).toInt(),
  completedAt: (json['completedAt'] as num?)?.toInt(),
  linkedTrackItIds: (json['linkedTrackItIds'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$TaskModelToJson(_TaskModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'title': instance.title,
      'category': _$TaskCategoryEnumMap[instance.category]!,
      'isCompleted': instance.isCompleted,
      'isHabit': instance.isHabit,
      'isPaused': instance.isPaused,
      'frequency': _$HabitFrequencyEnumMap[instance.frequency],
      'priority': _$TaskPriorityEnumMap[instance.priority],
      'targetTime': instance.targetTime,
      'timeSpent': instance.timeSpent,
      'isRunning': instance.isRunning,
      'lastStartedAt': instance.lastStartedAt,
      'date': instance.date,
      'order': instance.order,
      'createdAt': instance.createdAt,
      'completedAt': instance.completedAt,
      'linkedTrackItIds': instance.linkedTrackItIds,
    };

const _$TaskCategoryEnumMap = {
  TaskCategory.health: 'health',
  TaskCategory.work: 'work',
  TaskCategory.personal: 'personal',
  TaskCategory.learning: 'learning',
  TaskCategory.fitness: 'fitness',
  TaskCategory.other: 'other',
};

const _$HabitFrequencyEnumMap = {
  HabitFrequency.daily: 'daily',
  HabitFrequency.monSat: 'mon-sat',
  HabitFrequency.alternate: 'alternate',
  HabitFrequency.weekdays: 'weekdays',
  HabitFrequency.weekends: 'weekends',
};

const _$TaskPriorityEnumMap = {
  TaskPriority.low: 'low',
  TaskPriority.medium: 'medium',
  TaskPriority.high: 'high',
  TaskPriority.critical: 'critical',
};
