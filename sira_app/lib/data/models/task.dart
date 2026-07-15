import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

part 'task.freezed.dart';
part 'task.g.dart';

enum HabitFrequency {
  @JsonValue('daily') daily,
  @JsonValue('mon-sat') monSat,
  @JsonValue('alternate') alternate,
  @JsonValue('weekdays') weekdays,
  @JsonValue('weekends') weekends,
}

enum TaskPriority {
  @JsonValue('low') low,
  @JsonValue('medium') medium,
  @JsonValue('high') high,
  @JsonValue('critical') critical,
}

enum TaskCategory {
  @JsonValue('health') health,
  @JsonValue('work') work,
  @JsonValue('personal') personal,
  @JsonValue('learning') learning,
  @JsonValue('fitness') fitness,
  @JsonValue('other') other,
}

@freezed
abstract class TaskModel with _$TaskModel {
  const TaskModel._();
  const factory TaskModel({
    required String id,
    required String userId,
    required String title,
    required TaskCategory category,
    @Default(false) bool isCompleted,
    @Default(false) bool isHabit,
    bool? isPaused,
    HabitFrequency? frequency,
    TaskPriority? priority,
    int? targetTime, // in minutes
    int? timeSpent, // in seconds
    bool? isRunning,
    int? lastStartedAt, // unix timestamp
    required String date, // YYYY-MM-DD
    required int order,
    required int createdAt, // unix timestamp
    int? completedAt, // unix timestamp
    List<String>? linkedTrackItIds,
  }) = _TaskModel;

  factory TaskModel.fromJson(Map<String, dynamic> json) => _$TaskModelFromJson(json);
  
  factory TaskModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    data['id'] = doc.id;
    return TaskModel.fromJson(data);
  }
}
