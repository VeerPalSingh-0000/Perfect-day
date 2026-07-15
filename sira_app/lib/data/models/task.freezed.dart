// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'task.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$TaskModel {

 String get id; String get userId; String get title; TaskCategory get category; bool get isCompleted; bool get isHabit; bool? get isPaused; HabitFrequency? get frequency; TaskPriority? get priority; int? get targetTime; int? get timeSpent; bool? get isRunning; int? get lastStartedAt; String get date; int get order; int get createdAt; int? get completedAt; List<String>? get linkedTrackItIds;
/// Create a copy of TaskModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TaskModelCopyWith<TaskModel> get copyWith => _$TaskModelCopyWithImpl<TaskModel>(this as TaskModel, _$identity);

  /// Serializes this TaskModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TaskModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.title, title) || other.title == title)&&(identical(other.category, category) || other.category == category)&&(identical(other.isCompleted, isCompleted) || other.isCompleted == isCompleted)&&(identical(other.isHabit, isHabit) || other.isHabit == isHabit)&&(identical(other.isPaused, isPaused) || other.isPaused == isPaused)&&(identical(other.frequency, frequency) || other.frequency == frequency)&&(identical(other.priority, priority) || other.priority == priority)&&(identical(other.targetTime, targetTime) || other.targetTime == targetTime)&&(identical(other.timeSpent, timeSpent) || other.timeSpent == timeSpent)&&(identical(other.isRunning, isRunning) || other.isRunning == isRunning)&&(identical(other.lastStartedAt, lastStartedAt) || other.lastStartedAt == lastStartedAt)&&(identical(other.date, date) || other.date == date)&&(identical(other.order, order) || other.order == order)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.completedAt, completedAt) || other.completedAt == completedAt)&&const DeepCollectionEquality().equals(other.linkedTrackItIds, linkedTrackItIds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,title,category,isCompleted,isHabit,isPaused,frequency,priority,targetTime,timeSpent,isRunning,lastStartedAt,date,order,createdAt,completedAt,const DeepCollectionEquality().hash(linkedTrackItIds));

@override
String toString() {
  return 'TaskModel(id: $id, userId: $userId, title: $title, category: $category, isCompleted: $isCompleted, isHabit: $isHabit, isPaused: $isPaused, frequency: $frequency, priority: $priority, targetTime: $targetTime, timeSpent: $timeSpent, isRunning: $isRunning, lastStartedAt: $lastStartedAt, date: $date, order: $order, createdAt: $createdAt, completedAt: $completedAt, linkedTrackItIds: $linkedTrackItIds)';
}


}

/// @nodoc
abstract mixin class $TaskModelCopyWith<$Res>  {
  factory $TaskModelCopyWith(TaskModel value, $Res Function(TaskModel) _then) = _$TaskModelCopyWithImpl;
@useResult
$Res call({
 String id, String userId, String title, TaskCategory category, bool isCompleted, bool isHabit, bool? isPaused, HabitFrequency? frequency, TaskPriority? priority, int? targetTime, int? timeSpent, bool? isRunning, int? lastStartedAt, String date, int order, int createdAt, int? completedAt, List<String>? linkedTrackItIds
});




}
/// @nodoc
class _$TaskModelCopyWithImpl<$Res>
    implements $TaskModelCopyWith<$Res> {
  _$TaskModelCopyWithImpl(this._self, this._then);

  final TaskModel _self;
  final $Res Function(TaskModel) _then;

/// Create a copy of TaskModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? userId = null,Object? title = null,Object? category = null,Object? isCompleted = null,Object? isHabit = null,Object? isPaused = freezed,Object? frequency = freezed,Object? priority = freezed,Object? targetTime = freezed,Object? timeSpent = freezed,Object? isRunning = freezed,Object? lastStartedAt = freezed,Object? date = null,Object? order = null,Object? createdAt = null,Object? completedAt = freezed,Object? linkedTrackItIds = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as TaskCategory,isCompleted: null == isCompleted ? _self.isCompleted : isCompleted // ignore: cast_nullable_to_non_nullable
as bool,isHabit: null == isHabit ? _self.isHabit : isHabit // ignore: cast_nullable_to_non_nullable
as bool,isPaused: freezed == isPaused ? _self.isPaused : isPaused // ignore: cast_nullable_to_non_nullable
as bool?,frequency: freezed == frequency ? _self.frequency : frequency // ignore: cast_nullable_to_non_nullable
as HabitFrequency?,priority: freezed == priority ? _self.priority : priority // ignore: cast_nullable_to_non_nullable
as TaskPriority?,targetTime: freezed == targetTime ? _self.targetTime : targetTime // ignore: cast_nullable_to_non_nullable
as int?,timeSpent: freezed == timeSpent ? _self.timeSpent : timeSpent // ignore: cast_nullable_to_non_nullable
as int?,isRunning: freezed == isRunning ? _self.isRunning : isRunning // ignore: cast_nullable_to_non_nullable
as bool?,lastStartedAt: freezed == lastStartedAt ? _self.lastStartedAt : lastStartedAt // ignore: cast_nullable_to_non_nullable
as int?,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,completedAt: freezed == completedAt ? _self.completedAt : completedAt // ignore: cast_nullable_to_non_nullable
as int?,linkedTrackItIds: freezed == linkedTrackItIds ? _self.linkedTrackItIds : linkedTrackItIds // ignore: cast_nullable_to_non_nullable
as List<String>?,
  ));
}

}


/// Adds pattern-matching-related methods to [TaskModel].
extension TaskModelPatterns on TaskModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TaskModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TaskModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TaskModel value)  $default,){
final _that = this;
switch (_that) {
case _TaskModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TaskModel value)?  $default,){
final _that = this;
switch (_that) {
case _TaskModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String userId,  String title,  TaskCategory category,  bool isCompleted,  bool isHabit,  bool? isPaused,  HabitFrequency? frequency,  TaskPriority? priority,  int? targetTime,  int? timeSpent,  bool? isRunning,  int? lastStartedAt,  String date,  int order,  int createdAt,  int? completedAt,  List<String>? linkedTrackItIds)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TaskModel() when $default != null:
return $default(_that.id,_that.userId,_that.title,_that.category,_that.isCompleted,_that.isHabit,_that.isPaused,_that.frequency,_that.priority,_that.targetTime,_that.timeSpent,_that.isRunning,_that.lastStartedAt,_that.date,_that.order,_that.createdAt,_that.completedAt,_that.linkedTrackItIds);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String userId,  String title,  TaskCategory category,  bool isCompleted,  bool isHabit,  bool? isPaused,  HabitFrequency? frequency,  TaskPriority? priority,  int? targetTime,  int? timeSpent,  bool? isRunning,  int? lastStartedAt,  String date,  int order,  int createdAt,  int? completedAt,  List<String>? linkedTrackItIds)  $default,) {final _that = this;
switch (_that) {
case _TaskModel():
return $default(_that.id,_that.userId,_that.title,_that.category,_that.isCompleted,_that.isHabit,_that.isPaused,_that.frequency,_that.priority,_that.targetTime,_that.timeSpent,_that.isRunning,_that.lastStartedAt,_that.date,_that.order,_that.createdAt,_that.completedAt,_that.linkedTrackItIds);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String userId,  String title,  TaskCategory category,  bool isCompleted,  bool isHabit,  bool? isPaused,  HabitFrequency? frequency,  TaskPriority? priority,  int? targetTime,  int? timeSpent,  bool? isRunning,  int? lastStartedAt,  String date,  int order,  int createdAt,  int? completedAt,  List<String>? linkedTrackItIds)?  $default,) {final _that = this;
switch (_that) {
case _TaskModel() when $default != null:
return $default(_that.id,_that.userId,_that.title,_that.category,_that.isCompleted,_that.isHabit,_that.isPaused,_that.frequency,_that.priority,_that.targetTime,_that.timeSpent,_that.isRunning,_that.lastStartedAt,_that.date,_that.order,_that.createdAt,_that.completedAt,_that.linkedTrackItIds);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TaskModel extends TaskModel {
  const _TaskModel({required this.id, required this.userId, required this.title, required this.category, this.isCompleted = false, this.isHabit = false, this.isPaused, this.frequency, this.priority, this.targetTime, this.timeSpent, this.isRunning, this.lastStartedAt, required this.date, required this.order, required this.createdAt, this.completedAt, final  List<String>? linkedTrackItIds}): _linkedTrackItIds = linkedTrackItIds,super._();
  factory _TaskModel.fromJson(Map<String, dynamic> json) => _$TaskModelFromJson(json);

@override final  String id;
@override final  String userId;
@override final  String title;
@override final  TaskCategory category;
@override@JsonKey() final  bool isCompleted;
@override@JsonKey() final  bool isHabit;
@override final  bool? isPaused;
@override final  HabitFrequency? frequency;
@override final  TaskPriority? priority;
@override final  int? targetTime;
@override final  int? timeSpent;
@override final  bool? isRunning;
@override final  int? lastStartedAt;
@override final  String date;
@override final  int order;
@override final  int createdAt;
@override final  int? completedAt;
 final  List<String>? _linkedTrackItIds;
@override List<String>? get linkedTrackItIds {
  final value = _linkedTrackItIds;
  if (value == null) return null;
  if (_linkedTrackItIds is EqualUnmodifiableListView) return _linkedTrackItIds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}


/// Create a copy of TaskModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TaskModelCopyWith<_TaskModel> get copyWith => __$TaskModelCopyWithImpl<_TaskModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TaskModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TaskModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.title, title) || other.title == title)&&(identical(other.category, category) || other.category == category)&&(identical(other.isCompleted, isCompleted) || other.isCompleted == isCompleted)&&(identical(other.isHabit, isHabit) || other.isHabit == isHabit)&&(identical(other.isPaused, isPaused) || other.isPaused == isPaused)&&(identical(other.frequency, frequency) || other.frequency == frequency)&&(identical(other.priority, priority) || other.priority == priority)&&(identical(other.targetTime, targetTime) || other.targetTime == targetTime)&&(identical(other.timeSpent, timeSpent) || other.timeSpent == timeSpent)&&(identical(other.isRunning, isRunning) || other.isRunning == isRunning)&&(identical(other.lastStartedAt, lastStartedAt) || other.lastStartedAt == lastStartedAt)&&(identical(other.date, date) || other.date == date)&&(identical(other.order, order) || other.order == order)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.completedAt, completedAt) || other.completedAt == completedAt)&&const DeepCollectionEquality().equals(other._linkedTrackItIds, _linkedTrackItIds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,title,category,isCompleted,isHabit,isPaused,frequency,priority,targetTime,timeSpent,isRunning,lastStartedAt,date,order,createdAt,completedAt,const DeepCollectionEquality().hash(_linkedTrackItIds));

@override
String toString() {
  return 'TaskModel(id: $id, userId: $userId, title: $title, category: $category, isCompleted: $isCompleted, isHabit: $isHabit, isPaused: $isPaused, frequency: $frequency, priority: $priority, targetTime: $targetTime, timeSpent: $timeSpent, isRunning: $isRunning, lastStartedAt: $lastStartedAt, date: $date, order: $order, createdAt: $createdAt, completedAt: $completedAt, linkedTrackItIds: $linkedTrackItIds)';
}


}

/// @nodoc
abstract mixin class _$TaskModelCopyWith<$Res> implements $TaskModelCopyWith<$Res> {
  factory _$TaskModelCopyWith(_TaskModel value, $Res Function(_TaskModel) _then) = __$TaskModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String userId, String title, TaskCategory category, bool isCompleted, bool isHabit, bool? isPaused, HabitFrequency? frequency, TaskPriority? priority, int? targetTime, int? timeSpent, bool? isRunning, int? lastStartedAt, String date, int order, int createdAt, int? completedAt, List<String>? linkedTrackItIds
});




}
/// @nodoc
class __$TaskModelCopyWithImpl<$Res>
    implements _$TaskModelCopyWith<$Res> {
  __$TaskModelCopyWithImpl(this._self, this._then);

  final _TaskModel _self;
  final $Res Function(_TaskModel) _then;

/// Create a copy of TaskModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? userId = null,Object? title = null,Object? category = null,Object? isCompleted = null,Object? isHabit = null,Object? isPaused = freezed,Object? frequency = freezed,Object? priority = freezed,Object? targetTime = freezed,Object? timeSpent = freezed,Object? isRunning = freezed,Object? lastStartedAt = freezed,Object? date = null,Object? order = null,Object? createdAt = null,Object? completedAt = freezed,Object? linkedTrackItIds = freezed,}) {
  return _then(_TaskModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as TaskCategory,isCompleted: null == isCompleted ? _self.isCompleted : isCompleted // ignore: cast_nullable_to_non_nullable
as bool,isHabit: null == isHabit ? _self.isHabit : isHabit // ignore: cast_nullable_to_non_nullable
as bool,isPaused: freezed == isPaused ? _self.isPaused : isPaused // ignore: cast_nullable_to_non_nullable
as bool?,frequency: freezed == frequency ? _self.frequency : frequency // ignore: cast_nullable_to_non_nullable
as HabitFrequency?,priority: freezed == priority ? _self.priority : priority // ignore: cast_nullable_to_non_nullable
as TaskPriority?,targetTime: freezed == targetTime ? _self.targetTime : targetTime // ignore: cast_nullable_to_non_nullable
as int?,timeSpent: freezed == timeSpent ? _self.timeSpent : timeSpent // ignore: cast_nullable_to_non_nullable
as int?,isRunning: freezed == isRunning ? _self.isRunning : isRunning // ignore: cast_nullable_to_non_nullable
as bool?,lastStartedAt: freezed == lastStartedAt ? _self.lastStartedAt : lastStartedAt // ignore: cast_nullable_to_non_nullable
as int?,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as int,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,completedAt: freezed == completedAt ? _self.completedAt : completedAt // ignore: cast_nullable_to_non_nullable
as int?,linkedTrackItIds: freezed == linkedTrackItIds ? _self._linkedTrackItIds : linkedTrackItIds // ignore: cast_nullable_to_non_nullable
as List<String>?,
  ));
}


}

// dart format on
