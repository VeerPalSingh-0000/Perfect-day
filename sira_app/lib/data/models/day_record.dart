import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'task.dart';

part 'day_record.freezed.dart';
part 'day_record.g.dart';

enum DayRating {
  @JsonValue('perfect') perfect,
  @JsonValue('great') great,
  @JsonValue('good') good,
  @JsonValue('okay') okay,
  @JsonValue('rough') rough,
  @JsonValue('none') none,
}

@freezed
abstract class DayRecordModel with _$DayRecordModel {
  const DayRecordModel._();
  const factory DayRecordModel({
    required String id, // userId_YYYY-MM-DD
    required String userId,
    required String date,
    required int totalTasks,
    required int completedTasks,
    required int completionPercentage,
    required DayRating rating,
    required List<TaskModel> tasks,
    required int createdAt, // unix timestamp
    String? focusWord,
    int? totalFocusTime, // in minutes
  }) = _DayRecordModel;

  factory DayRecordModel.fromJson(Map<String, dynamic> json) => _$DayRecordModelFromJson(json);
  
  factory DayRecordModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    data['id'] = doc.id;
    return DayRecordModel.fromJson(data);
  }
}
