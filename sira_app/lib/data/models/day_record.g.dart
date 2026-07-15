// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'day_record.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_DayRecordModel _$DayRecordModelFromJson(Map<String, dynamic> json) =>
    _DayRecordModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      date: json['date'] as String,
      totalTasks: (json['totalTasks'] as num).toInt(),
      completedTasks: (json['completedTasks'] as num).toInt(),
      completionPercentage: (json['completionPercentage'] as num).toInt(),
      rating: $enumDecode(_$DayRatingEnumMap, json['rating']),
      tasks: (json['tasks'] as List<dynamic>)
          .map((e) => TaskModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      createdAt: (json['createdAt'] as num).toInt(),
      focusWord: json['focusWord'] as String?,
      totalFocusTime: (json['totalFocusTime'] as num?)?.toInt(),
    );

Map<String, dynamic> _$DayRecordModelToJson(_DayRecordModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'date': instance.date,
      'totalTasks': instance.totalTasks,
      'completedTasks': instance.completedTasks,
      'completionPercentage': instance.completionPercentage,
      'rating': _$DayRatingEnumMap[instance.rating]!,
      'tasks': instance.tasks,
      'createdAt': instance.createdAt,
      'focusWord': instance.focusWord,
      'totalFocusTime': instance.totalFocusTime,
    };

const _$DayRatingEnumMap = {
  DayRating.perfect: 'perfect',
  DayRating.great: 'great',
  DayRating.good: 'good',
  DayRating.okay: 'okay',
  DayRating.rough: 'rough',
  DayRating.none: 'none',
};
