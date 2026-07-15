// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'target.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_DayStep _$DayStepFromJson(Map<String, dynamic> json) => _DayStep(
  day: (json['day'] as num).toInt(),
  title: json['title'] as String,
  description: json['description'] as String,
  isCompleted: json['isCompleted'] as bool? ?? false,
  completedAt: (json['completedAt'] as num?)?.toInt(),
  isMilestone: json['isMilestone'] as bool?,
  notes: json['notes'] as String?,
);

Map<String, dynamic> _$DayStepToJson(_DayStep instance) => <String, dynamic>{
  'day': instance.day,
  'title': instance.title,
  'description': instance.description,
  'isCompleted': instance.isCompleted,
  'completedAt': instance.completedAt,
  'isMilestone': instance.isMilestone,
  'notes': instance.notes,
};

_TargetModel _$TargetModelFromJson(Map<String, dynamic> json) => _TargetModel(
  id: json['id'] as String,
  userId: json['userId'] as String,
  title: json['title'] as String,
  category: $enumDecode(_$TargetCategoryEnumMap, json['category']),
  totalDays: (json['totalDays'] as num).toInt(),
  plan: (json['plan'] as List<dynamic>)
      .map((e) => DayStep.fromJson(e as Map<String, dynamic>))
      .toList(),
  completedDays: (json['completedDays'] as List<dynamic>)
      .map((e) => (e as num).toInt())
      .toList(),
  createdAt: (json['createdAt'] as num).toInt(),
  startDate: json['startDate'] as String,
  deadline: json['deadline'] as String?,
  status: $enumDecode(_$TargetStatusEnumMap, json['status']),
  emoji: json['emoji'] as String?,
  bestStreak: (json['bestStreak'] as num?)?.toInt(),
  currentStreak: (json['currentStreak'] as num?)?.toInt(),
  linkedTrackItIds: (json['linkedTrackItIds'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$TargetModelToJson(_TargetModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'title': instance.title,
      'category': _$TargetCategoryEnumMap[instance.category]!,
      'totalDays': instance.totalDays,
      'plan': instance.plan,
      'completedDays': instance.completedDays,
      'createdAt': instance.createdAt,
      'startDate': instance.startDate,
      'deadline': instance.deadline,
      'status': _$TargetStatusEnumMap[instance.status]!,
      'emoji': instance.emoji,
      'bestStreak': instance.bestStreak,
      'currentStreak': instance.currentStreak,
      'linkedTrackItIds': instance.linkedTrackItIds,
    };

const _$TargetCategoryEnumMap = {
  TargetCategory.learning: 'learning',
  TargetCategory.fitness: 'fitness',
  TargetCategory.career: 'career',
  TargetCategory.creative: 'creative',
  TargetCategory.discipline: 'discipline',
  TargetCategory.custom: 'custom',
};

const _$TargetStatusEnumMap = {
  TargetStatus.active: 'active',
  TargetStatus.paused: 'paused',
  TargetStatus.completed: 'completed',
  TargetStatus.abandoned: 'abandoned',
};
