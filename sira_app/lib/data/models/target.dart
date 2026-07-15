import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

part 'target.freezed.dart';
part 'target.g.dart';

enum TargetStatus {
  @JsonValue('active') active,
  @JsonValue('paused') paused,
  @JsonValue('completed') completed,
  @JsonValue('abandoned') abandoned,
}

enum TargetCategory {
  @JsonValue('learning') learning,
  @JsonValue('fitness') fitness,
  @JsonValue('career') career,
  @JsonValue('creative') creative,
  @JsonValue('discipline') discipline,
  @JsonValue('custom') custom,
}

@freezed
abstract class DayStep with _$DayStep {
  const DayStep._();
  const factory DayStep({
    required int day,
    required String title,
    required String description,
    @Default(false) bool isCompleted,
    int? completedAt,
    bool? isMilestone,
    String? notes,
  }) = _DayStep;

  factory DayStep.fromJson(Map<String, dynamic> json) => _$DayStepFromJson(json);
}

@freezed
abstract class TargetModel with _$TargetModel {
  const TargetModel._();
  const factory TargetModel({
    required String id,
    required String userId,
    required String title,
    required TargetCategory category,
    required int totalDays,
    required List<DayStep> plan,
    required List<int> completedDays,
    required int createdAt, // unix timestamp
    required String startDate, // YYYY-MM-DD
    String? deadline, // YYYY-MM-DD
    required TargetStatus status,
    String? emoji,
    int? bestStreak,
    int? currentStreak,
    List<String>? linkedTrackItIds,
  }) = _TargetModel;

  factory TargetModel.fromJson(Map<String, dynamic> json) => _$TargetModelFromJson(json);
  
  factory TargetModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    data['id'] = doc.id;
    return TargetModel.fromJson(data);
  }
}
