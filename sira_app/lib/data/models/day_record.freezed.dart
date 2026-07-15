// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'day_record.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$DayRecordModel {

 String get id; String get userId; String get date; int get totalTasks; int get completedTasks; int get completionPercentage; DayRating get rating; List<TaskModel> get tasks; int get createdAt; String? get focusWord; int? get totalFocusTime;
/// Create a copy of DayRecordModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DayRecordModelCopyWith<DayRecordModel> get copyWith => _$DayRecordModelCopyWithImpl<DayRecordModel>(this as DayRecordModel, _$identity);

  /// Serializes this DayRecordModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DayRecordModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.date, date) || other.date == date)&&(identical(other.totalTasks, totalTasks) || other.totalTasks == totalTasks)&&(identical(other.completedTasks, completedTasks) || other.completedTasks == completedTasks)&&(identical(other.completionPercentage, completionPercentage) || other.completionPercentage == completionPercentage)&&(identical(other.rating, rating) || other.rating == rating)&&const DeepCollectionEquality().equals(other.tasks, tasks)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.focusWord, focusWord) || other.focusWord == focusWord)&&(identical(other.totalFocusTime, totalFocusTime) || other.totalFocusTime == totalFocusTime));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,date,totalTasks,completedTasks,completionPercentage,rating,const DeepCollectionEquality().hash(tasks),createdAt,focusWord,totalFocusTime);

@override
String toString() {
  return 'DayRecordModel(id: $id, userId: $userId, date: $date, totalTasks: $totalTasks, completedTasks: $completedTasks, completionPercentage: $completionPercentage, rating: $rating, tasks: $tasks, createdAt: $createdAt, focusWord: $focusWord, totalFocusTime: $totalFocusTime)';
}


}

/// @nodoc
abstract mixin class $DayRecordModelCopyWith<$Res>  {
  factory $DayRecordModelCopyWith(DayRecordModel value, $Res Function(DayRecordModel) _then) = _$DayRecordModelCopyWithImpl;
@useResult
$Res call({
 String id, String userId, String date, int totalTasks, int completedTasks, int completionPercentage, DayRating rating, List<TaskModel> tasks, int createdAt, String? focusWord, int? totalFocusTime
});




}
/// @nodoc
class _$DayRecordModelCopyWithImpl<$Res>
    implements $DayRecordModelCopyWith<$Res> {
  _$DayRecordModelCopyWithImpl(this._self, this._then);

  final DayRecordModel _self;
  final $Res Function(DayRecordModel) _then;

/// Create a copy of DayRecordModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? userId = null,Object? date = null,Object? totalTasks = null,Object? completedTasks = null,Object? completionPercentage = null,Object? rating = null,Object? tasks = null,Object? createdAt = null,Object? focusWord = freezed,Object? totalFocusTime = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,totalTasks: null == totalTasks ? _self.totalTasks : totalTasks // ignore: cast_nullable_to_non_nullable
as int,completedTasks: null == completedTasks ? _self.completedTasks : completedTasks // ignore: cast_nullable_to_non_nullable
as int,completionPercentage: null == completionPercentage ? _self.completionPercentage : completionPercentage // ignore: cast_nullable_to_non_nullable
as int,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as DayRating,tasks: null == tasks ? _self.tasks : tasks // ignore: cast_nullable_to_non_nullable
as List<TaskModel>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,focusWord: freezed == focusWord ? _self.focusWord : focusWord // ignore: cast_nullable_to_non_nullable
as String?,totalFocusTime: freezed == totalFocusTime ? _self.totalFocusTime : totalFocusTime // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [DayRecordModel].
extension DayRecordModelPatterns on DayRecordModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DayRecordModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DayRecordModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DayRecordModel value)  $default,){
final _that = this;
switch (_that) {
case _DayRecordModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DayRecordModel value)?  $default,){
final _that = this;
switch (_that) {
case _DayRecordModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String userId,  String date,  int totalTasks,  int completedTasks,  int completionPercentage,  DayRating rating,  List<TaskModel> tasks,  int createdAt,  String? focusWord,  int? totalFocusTime)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DayRecordModel() when $default != null:
return $default(_that.id,_that.userId,_that.date,_that.totalTasks,_that.completedTasks,_that.completionPercentage,_that.rating,_that.tasks,_that.createdAt,_that.focusWord,_that.totalFocusTime);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String userId,  String date,  int totalTasks,  int completedTasks,  int completionPercentage,  DayRating rating,  List<TaskModel> tasks,  int createdAt,  String? focusWord,  int? totalFocusTime)  $default,) {final _that = this;
switch (_that) {
case _DayRecordModel():
return $default(_that.id,_that.userId,_that.date,_that.totalTasks,_that.completedTasks,_that.completionPercentage,_that.rating,_that.tasks,_that.createdAt,_that.focusWord,_that.totalFocusTime);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String userId,  String date,  int totalTasks,  int completedTasks,  int completionPercentage,  DayRating rating,  List<TaskModel> tasks,  int createdAt,  String? focusWord,  int? totalFocusTime)?  $default,) {final _that = this;
switch (_that) {
case _DayRecordModel() when $default != null:
return $default(_that.id,_that.userId,_that.date,_that.totalTasks,_that.completedTasks,_that.completionPercentage,_that.rating,_that.tasks,_that.createdAt,_that.focusWord,_that.totalFocusTime);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _DayRecordModel extends DayRecordModel {
  const _DayRecordModel({required this.id, required this.userId, required this.date, required this.totalTasks, required this.completedTasks, required this.completionPercentage, required this.rating, required final  List<TaskModel> tasks, required this.createdAt, this.focusWord, this.totalFocusTime}): _tasks = tasks,super._();
  factory _DayRecordModel.fromJson(Map<String, dynamic> json) => _$DayRecordModelFromJson(json);

@override final  String id;
@override final  String userId;
@override final  String date;
@override final  int totalTasks;
@override final  int completedTasks;
@override final  int completionPercentage;
@override final  DayRating rating;
 final  List<TaskModel> _tasks;
@override List<TaskModel> get tasks {
  if (_tasks is EqualUnmodifiableListView) return _tasks;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_tasks);
}

@override final  int createdAt;
@override final  String? focusWord;
@override final  int? totalFocusTime;

/// Create a copy of DayRecordModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DayRecordModelCopyWith<_DayRecordModel> get copyWith => __$DayRecordModelCopyWithImpl<_DayRecordModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DayRecordModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DayRecordModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.date, date) || other.date == date)&&(identical(other.totalTasks, totalTasks) || other.totalTasks == totalTasks)&&(identical(other.completedTasks, completedTasks) || other.completedTasks == completedTasks)&&(identical(other.completionPercentage, completionPercentage) || other.completionPercentage == completionPercentage)&&(identical(other.rating, rating) || other.rating == rating)&&const DeepCollectionEquality().equals(other._tasks, _tasks)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.focusWord, focusWord) || other.focusWord == focusWord)&&(identical(other.totalFocusTime, totalFocusTime) || other.totalFocusTime == totalFocusTime));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,date,totalTasks,completedTasks,completionPercentage,rating,const DeepCollectionEquality().hash(_tasks),createdAt,focusWord,totalFocusTime);

@override
String toString() {
  return 'DayRecordModel(id: $id, userId: $userId, date: $date, totalTasks: $totalTasks, completedTasks: $completedTasks, completionPercentage: $completionPercentage, rating: $rating, tasks: $tasks, createdAt: $createdAt, focusWord: $focusWord, totalFocusTime: $totalFocusTime)';
}


}

/// @nodoc
abstract mixin class _$DayRecordModelCopyWith<$Res> implements $DayRecordModelCopyWith<$Res> {
  factory _$DayRecordModelCopyWith(_DayRecordModel value, $Res Function(_DayRecordModel) _then) = __$DayRecordModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String userId, String date, int totalTasks, int completedTasks, int completionPercentage, DayRating rating, List<TaskModel> tasks, int createdAt, String? focusWord, int? totalFocusTime
});




}
/// @nodoc
class __$DayRecordModelCopyWithImpl<$Res>
    implements _$DayRecordModelCopyWith<$Res> {
  __$DayRecordModelCopyWithImpl(this._self, this._then);

  final _DayRecordModel _self;
  final $Res Function(_DayRecordModel) _then;

/// Create a copy of DayRecordModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? userId = null,Object? date = null,Object? totalTasks = null,Object? completedTasks = null,Object? completionPercentage = null,Object? rating = null,Object? tasks = null,Object? createdAt = null,Object? focusWord = freezed,Object? totalFocusTime = freezed,}) {
  return _then(_DayRecordModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as String,totalTasks: null == totalTasks ? _self.totalTasks : totalTasks // ignore: cast_nullable_to_non_nullable
as int,completedTasks: null == completedTasks ? _self.completedTasks : completedTasks // ignore: cast_nullable_to_non_nullable
as int,completionPercentage: null == completionPercentage ? _self.completionPercentage : completionPercentage // ignore: cast_nullable_to_non_nullable
as int,rating: null == rating ? _self.rating : rating // ignore: cast_nullable_to_non_nullable
as DayRating,tasks: null == tasks ? _self._tasks : tasks // ignore: cast_nullable_to_non_nullable
as List<TaskModel>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,focusWord: freezed == focusWord ? _self.focusWord : focusWord // ignore: cast_nullable_to_non_nullable
as String?,totalFocusTime: freezed == totalFocusTime ? _self.totalFocusTime : totalFocusTime // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

// dart format on
