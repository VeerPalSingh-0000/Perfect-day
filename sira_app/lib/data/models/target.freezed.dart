// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'target.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$DayStep {

 int get day; String get title; String get description; bool get isCompleted; int? get completedAt; bool? get isMilestone; String? get notes;
/// Create a copy of DayStep
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DayStepCopyWith<DayStep> get copyWith => _$DayStepCopyWithImpl<DayStep>(this as DayStep, _$identity);

  /// Serializes this DayStep to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DayStep&&(identical(other.day, day) || other.day == day)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.isCompleted, isCompleted) || other.isCompleted == isCompleted)&&(identical(other.completedAt, completedAt) || other.completedAt == completedAt)&&(identical(other.isMilestone, isMilestone) || other.isMilestone == isMilestone)&&(identical(other.notes, notes) || other.notes == notes));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,day,title,description,isCompleted,completedAt,isMilestone,notes);

@override
String toString() {
  return 'DayStep(day: $day, title: $title, description: $description, isCompleted: $isCompleted, completedAt: $completedAt, isMilestone: $isMilestone, notes: $notes)';
}


}

/// @nodoc
abstract mixin class $DayStepCopyWith<$Res>  {
  factory $DayStepCopyWith(DayStep value, $Res Function(DayStep) _then) = _$DayStepCopyWithImpl;
@useResult
$Res call({
 int day, String title, String description, bool isCompleted, int? completedAt, bool? isMilestone, String? notes
});




}
/// @nodoc
class _$DayStepCopyWithImpl<$Res>
    implements $DayStepCopyWith<$Res> {
  _$DayStepCopyWithImpl(this._self, this._then);

  final DayStep _self;
  final $Res Function(DayStep) _then;

/// Create a copy of DayStep
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? day = null,Object? title = null,Object? description = null,Object? isCompleted = null,Object? completedAt = freezed,Object? isMilestone = freezed,Object? notes = freezed,}) {
  return _then(_self.copyWith(
day: null == day ? _self.day : day // ignore: cast_nullable_to_non_nullable
as int,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,isCompleted: null == isCompleted ? _self.isCompleted : isCompleted // ignore: cast_nullable_to_non_nullable
as bool,completedAt: freezed == completedAt ? _self.completedAt : completedAt // ignore: cast_nullable_to_non_nullable
as int?,isMilestone: freezed == isMilestone ? _self.isMilestone : isMilestone // ignore: cast_nullable_to_non_nullable
as bool?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [DayStep].
extension DayStepPatterns on DayStep {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DayStep value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DayStep() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DayStep value)  $default,){
final _that = this;
switch (_that) {
case _DayStep():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DayStep value)?  $default,){
final _that = this;
switch (_that) {
case _DayStep() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int day,  String title,  String description,  bool isCompleted,  int? completedAt,  bool? isMilestone,  String? notes)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DayStep() when $default != null:
return $default(_that.day,_that.title,_that.description,_that.isCompleted,_that.completedAt,_that.isMilestone,_that.notes);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int day,  String title,  String description,  bool isCompleted,  int? completedAt,  bool? isMilestone,  String? notes)  $default,) {final _that = this;
switch (_that) {
case _DayStep():
return $default(_that.day,_that.title,_that.description,_that.isCompleted,_that.completedAt,_that.isMilestone,_that.notes);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int day,  String title,  String description,  bool isCompleted,  int? completedAt,  bool? isMilestone,  String? notes)?  $default,) {final _that = this;
switch (_that) {
case _DayStep() when $default != null:
return $default(_that.day,_that.title,_that.description,_that.isCompleted,_that.completedAt,_that.isMilestone,_that.notes);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _DayStep extends DayStep {
  const _DayStep({required this.day, required this.title, required this.description, this.isCompleted = false, this.completedAt, this.isMilestone, this.notes}): super._();
  factory _DayStep.fromJson(Map<String, dynamic> json) => _$DayStepFromJson(json);

@override final  int day;
@override final  String title;
@override final  String description;
@override@JsonKey() final  bool isCompleted;
@override final  int? completedAt;
@override final  bool? isMilestone;
@override final  String? notes;

/// Create a copy of DayStep
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DayStepCopyWith<_DayStep> get copyWith => __$DayStepCopyWithImpl<_DayStep>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DayStepToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DayStep&&(identical(other.day, day) || other.day == day)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.isCompleted, isCompleted) || other.isCompleted == isCompleted)&&(identical(other.completedAt, completedAt) || other.completedAt == completedAt)&&(identical(other.isMilestone, isMilestone) || other.isMilestone == isMilestone)&&(identical(other.notes, notes) || other.notes == notes));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,day,title,description,isCompleted,completedAt,isMilestone,notes);

@override
String toString() {
  return 'DayStep(day: $day, title: $title, description: $description, isCompleted: $isCompleted, completedAt: $completedAt, isMilestone: $isMilestone, notes: $notes)';
}


}

/// @nodoc
abstract mixin class _$DayStepCopyWith<$Res> implements $DayStepCopyWith<$Res> {
  factory _$DayStepCopyWith(_DayStep value, $Res Function(_DayStep) _then) = __$DayStepCopyWithImpl;
@override @useResult
$Res call({
 int day, String title, String description, bool isCompleted, int? completedAt, bool? isMilestone, String? notes
});




}
/// @nodoc
class __$DayStepCopyWithImpl<$Res>
    implements _$DayStepCopyWith<$Res> {
  __$DayStepCopyWithImpl(this._self, this._then);

  final _DayStep _self;
  final $Res Function(_DayStep) _then;

/// Create a copy of DayStep
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? day = null,Object? title = null,Object? description = null,Object? isCompleted = null,Object? completedAt = freezed,Object? isMilestone = freezed,Object? notes = freezed,}) {
  return _then(_DayStep(
day: null == day ? _self.day : day // ignore: cast_nullable_to_non_nullable
as int,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,isCompleted: null == isCompleted ? _self.isCompleted : isCompleted // ignore: cast_nullable_to_non_nullable
as bool,completedAt: freezed == completedAt ? _self.completedAt : completedAt // ignore: cast_nullable_to_non_nullable
as int?,isMilestone: freezed == isMilestone ? _self.isMilestone : isMilestone // ignore: cast_nullable_to_non_nullable
as bool?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$TargetModel {

 String get id; String get userId; String get title; TargetCategory get category; int get totalDays; List<DayStep> get plan; List<int> get completedDays; int get createdAt; String get startDate; String? get deadline; TargetStatus get status; String? get emoji; int? get bestStreak; int? get currentStreak; List<String>? get linkedTrackItIds;
/// Create a copy of TargetModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TargetModelCopyWith<TargetModel> get copyWith => _$TargetModelCopyWithImpl<TargetModel>(this as TargetModel, _$identity);

  /// Serializes this TargetModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TargetModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.title, title) || other.title == title)&&(identical(other.category, category) || other.category == category)&&(identical(other.totalDays, totalDays) || other.totalDays == totalDays)&&const DeepCollectionEquality().equals(other.plan, plan)&&const DeepCollectionEquality().equals(other.completedDays, completedDays)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.startDate, startDate) || other.startDate == startDate)&&(identical(other.deadline, deadline) || other.deadline == deadline)&&(identical(other.status, status) || other.status == status)&&(identical(other.emoji, emoji) || other.emoji == emoji)&&(identical(other.bestStreak, bestStreak) || other.bestStreak == bestStreak)&&(identical(other.currentStreak, currentStreak) || other.currentStreak == currentStreak)&&const DeepCollectionEquality().equals(other.linkedTrackItIds, linkedTrackItIds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,title,category,totalDays,const DeepCollectionEquality().hash(plan),const DeepCollectionEquality().hash(completedDays),createdAt,startDate,deadline,status,emoji,bestStreak,currentStreak,const DeepCollectionEquality().hash(linkedTrackItIds));

@override
String toString() {
  return 'TargetModel(id: $id, userId: $userId, title: $title, category: $category, totalDays: $totalDays, plan: $plan, completedDays: $completedDays, createdAt: $createdAt, startDate: $startDate, deadline: $deadline, status: $status, emoji: $emoji, bestStreak: $bestStreak, currentStreak: $currentStreak, linkedTrackItIds: $linkedTrackItIds)';
}


}

/// @nodoc
abstract mixin class $TargetModelCopyWith<$Res>  {
  factory $TargetModelCopyWith(TargetModel value, $Res Function(TargetModel) _then) = _$TargetModelCopyWithImpl;
@useResult
$Res call({
 String id, String userId, String title, TargetCategory category, int totalDays, List<DayStep> plan, List<int> completedDays, int createdAt, String startDate, String? deadline, TargetStatus status, String? emoji, int? bestStreak, int? currentStreak, List<String>? linkedTrackItIds
});




}
/// @nodoc
class _$TargetModelCopyWithImpl<$Res>
    implements $TargetModelCopyWith<$Res> {
  _$TargetModelCopyWithImpl(this._self, this._then);

  final TargetModel _self;
  final $Res Function(TargetModel) _then;

/// Create a copy of TargetModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? userId = null,Object? title = null,Object? category = null,Object? totalDays = null,Object? plan = null,Object? completedDays = null,Object? createdAt = null,Object? startDate = null,Object? deadline = freezed,Object? status = null,Object? emoji = freezed,Object? bestStreak = freezed,Object? currentStreak = freezed,Object? linkedTrackItIds = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as TargetCategory,totalDays: null == totalDays ? _self.totalDays : totalDays // ignore: cast_nullable_to_non_nullable
as int,plan: null == plan ? _self.plan : plan // ignore: cast_nullable_to_non_nullable
as List<DayStep>,completedDays: null == completedDays ? _self.completedDays : completedDays // ignore: cast_nullable_to_non_nullable
as List<int>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,startDate: null == startDate ? _self.startDate : startDate // ignore: cast_nullable_to_non_nullable
as String,deadline: freezed == deadline ? _self.deadline : deadline // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as TargetStatus,emoji: freezed == emoji ? _self.emoji : emoji // ignore: cast_nullable_to_non_nullable
as String?,bestStreak: freezed == bestStreak ? _self.bestStreak : bestStreak // ignore: cast_nullable_to_non_nullable
as int?,currentStreak: freezed == currentStreak ? _self.currentStreak : currentStreak // ignore: cast_nullable_to_non_nullable
as int?,linkedTrackItIds: freezed == linkedTrackItIds ? _self.linkedTrackItIds : linkedTrackItIds // ignore: cast_nullable_to_non_nullable
as List<String>?,
  ));
}

}


/// Adds pattern-matching-related methods to [TargetModel].
extension TargetModelPatterns on TargetModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TargetModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TargetModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TargetModel value)  $default,){
final _that = this;
switch (_that) {
case _TargetModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TargetModel value)?  $default,){
final _that = this;
switch (_that) {
case _TargetModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String userId,  String title,  TargetCategory category,  int totalDays,  List<DayStep> plan,  List<int> completedDays,  int createdAt,  String startDate,  String? deadline,  TargetStatus status,  String? emoji,  int? bestStreak,  int? currentStreak,  List<String>? linkedTrackItIds)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TargetModel() when $default != null:
return $default(_that.id,_that.userId,_that.title,_that.category,_that.totalDays,_that.plan,_that.completedDays,_that.createdAt,_that.startDate,_that.deadline,_that.status,_that.emoji,_that.bestStreak,_that.currentStreak,_that.linkedTrackItIds);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String userId,  String title,  TargetCategory category,  int totalDays,  List<DayStep> plan,  List<int> completedDays,  int createdAt,  String startDate,  String? deadline,  TargetStatus status,  String? emoji,  int? bestStreak,  int? currentStreak,  List<String>? linkedTrackItIds)  $default,) {final _that = this;
switch (_that) {
case _TargetModel():
return $default(_that.id,_that.userId,_that.title,_that.category,_that.totalDays,_that.plan,_that.completedDays,_that.createdAt,_that.startDate,_that.deadline,_that.status,_that.emoji,_that.bestStreak,_that.currentStreak,_that.linkedTrackItIds);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String userId,  String title,  TargetCategory category,  int totalDays,  List<DayStep> plan,  List<int> completedDays,  int createdAt,  String startDate,  String? deadline,  TargetStatus status,  String? emoji,  int? bestStreak,  int? currentStreak,  List<String>? linkedTrackItIds)?  $default,) {final _that = this;
switch (_that) {
case _TargetModel() when $default != null:
return $default(_that.id,_that.userId,_that.title,_that.category,_that.totalDays,_that.plan,_that.completedDays,_that.createdAt,_that.startDate,_that.deadline,_that.status,_that.emoji,_that.bestStreak,_that.currentStreak,_that.linkedTrackItIds);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TargetModel extends TargetModel {
  const _TargetModel({required this.id, required this.userId, required this.title, required this.category, required this.totalDays, required final  List<DayStep> plan, required final  List<int> completedDays, required this.createdAt, required this.startDate, this.deadline, required this.status, this.emoji, this.bestStreak, this.currentStreak, final  List<String>? linkedTrackItIds}): _plan = plan,_completedDays = completedDays,_linkedTrackItIds = linkedTrackItIds,super._();
  factory _TargetModel.fromJson(Map<String, dynamic> json) => _$TargetModelFromJson(json);

@override final  String id;
@override final  String userId;
@override final  String title;
@override final  TargetCategory category;
@override final  int totalDays;
 final  List<DayStep> _plan;
@override List<DayStep> get plan {
  if (_plan is EqualUnmodifiableListView) return _plan;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_plan);
}

 final  List<int> _completedDays;
@override List<int> get completedDays {
  if (_completedDays is EqualUnmodifiableListView) return _completedDays;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_completedDays);
}

@override final  int createdAt;
@override final  String startDate;
@override final  String? deadline;
@override final  TargetStatus status;
@override final  String? emoji;
@override final  int? bestStreak;
@override final  int? currentStreak;
 final  List<String>? _linkedTrackItIds;
@override List<String>? get linkedTrackItIds {
  final value = _linkedTrackItIds;
  if (value == null) return null;
  if (_linkedTrackItIds is EqualUnmodifiableListView) return _linkedTrackItIds;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}


/// Create a copy of TargetModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TargetModelCopyWith<_TargetModel> get copyWith => __$TargetModelCopyWithImpl<_TargetModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TargetModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TargetModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.title, title) || other.title == title)&&(identical(other.category, category) || other.category == category)&&(identical(other.totalDays, totalDays) || other.totalDays == totalDays)&&const DeepCollectionEquality().equals(other._plan, _plan)&&const DeepCollectionEquality().equals(other._completedDays, _completedDays)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.startDate, startDate) || other.startDate == startDate)&&(identical(other.deadline, deadline) || other.deadline == deadline)&&(identical(other.status, status) || other.status == status)&&(identical(other.emoji, emoji) || other.emoji == emoji)&&(identical(other.bestStreak, bestStreak) || other.bestStreak == bestStreak)&&(identical(other.currentStreak, currentStreak) || other.currentStreak == currentStreak)&&const DeepCollectionEquality().equals(other._linkedTrackItIds, _linkedTrackItIds));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,title,category,totalDays,const DeepCollectionEquality().hash(_plan),const DeepCollectionEquality().hash(_completedDays),createdAt,startDate,deadline,status,emoji,bestStreak,currentStreak,const DeepCollectionEquality().hash(_linkedTrackItIds));

@override
String toString() {
  return 'TargetModel(id: $id, userId: $userId, title: $title, category: $category, totalDays: $totalDays, plan: $plan, completedDays: $completedDays, createdAt: $createdAt, startDate: $startDate, deadline: $deadline, status: $status, emoji: $emoji, bestStreak: $bestStreak, currentStreak: $currentStreak, linkedTrackItIds: $linkedTrackItIds)';
}


}

/// @nodoc
abstract mixin class _$TargetModelCopyWith<$Res> implements $TargetModelCopyWith<$Res> {
  factory _$TargetModelCopyWith(_TargetModel value, $Res Function(_TargetModel) _then) = __$TargetModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String userId, String title, TargetCategory category, int totalDays, List<DayStep> plan, List<int> completedDays, int createdAt, String startDate, String? deadline, TargetStatus status, String? emoji, int? bestStreak, int? currentStreak, List<String>? linkedTrackItIds
});




}
/// @nodoc
class __$TargetModelCopyWithImpl<$Res>
    implements _$TargetModelCopyWith<$Res> {
  __$TargetModelCopyWithImpl(this._self, this._then);

  final _TargetModel _self;
  final $Res Function(_TargetModel) _then;

/// Create a copy of TargetModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? userId = null,Object? title = null,Object? category = null,Object? totalDays = null,Object? plan = null,Object? completedDays = null,Object? createdAt = null,Object? startDate = null,Object? deadline = freezed,Object? status = null,Object? emoji = freezed,Object? bestStreak = freezed,Object? currentStreak = freezed,Object? linkedTrackItIds = freezed,}) {
  return _then(_TargetModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as TargetCategory,totalDays: null == totalDays ? _self.totalDays : totalDays // ignore: cast_nullable_to_non_nullable
as int,plan: null == plan ? _self._plan : plan // ignore: cast_nullable_to_non_nullable
as List<DayStep>,completedDays: null == completedDays ? _self._completedDays : completedDays // ignore: cast_nullable_to_non_nullable
as List<int>,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as int,startDate: null == startDate ? _self.startDate : startDate // ignore: cast_nullable_to_non_nullable
as String,deadline: freezed == deadline ? _self.deadline : deadline // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as TargetStatus,emoji: freezed == emoji ? _self.emoji : emoji // ignore: cast_nullable_to_non_nullable
as String?,bestStreak: freezed == bestStreak ? _self.bestStreak : bestStreak // ignore: cast_nullable_to_non_nullable
as int?,currentStreak: freezed == currentStreak ? _self.currentStreak : currentStreak // ignore: cast_nullable_to_non_nullable
as int?,linkedTrackItIds: freezed == linkedTrackItIds ? _self._linkedTrackItIds : linkedTrackItIds // ignore: cast_nullable_to_non_nullable
as List<String>?,
  ));
}


}

// dart format on
