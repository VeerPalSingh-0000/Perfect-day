import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../data/models/task.dart';
import '../../data/models/target.dart';
import '../../data/models/day_record.dart';
import 'auth_provider.dart';

// Firestore instance provider
final firestoreProvider = Provider<FirebaseFirestore>((ref) {
  return FirebaseFirestore.instance;
});

// Tasks Stream Provider
final tasksProvider = StreamProvider<List<TaskModel>>((ref) {
  final user = ref.watch(authStateProvider).value;
  final userId = user?.uid ?? 'test_user';

  final db = ref.watch(firestoreProvider);
  
  return db
      .collection('users')
      .doc(userId)
      .collection('tasks')
      .orderBy('order')
      .snapshots()
      .map((snapshot) {
    return snapshot.docs.map((doc) => TaskModel.fromFirestore(doc)).toList();
  });
});

// Day Records Stream Provider
final dayRecordsProvider = StreamProvider<List<DayRecordModel>>((ref) {
  final user = ref.watch(authStateProvider).value;
  final userId = user?.uid ?? 'test_user';

  final db = ref.watch(firestoreProvider);
  
  return db
      .collection('users')
      .doc(userId)
      .collection('dayRecords')
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((snapshot) {
    return snapshot.docs.map((doc) => DayRecordModel.fromFirestore(doc)).toList();
  });
});

// Targets Stream Provider
final targetsProvider = StreamProvider<List<TargetModel>>((ref) {
  final user = ref.watch(authStateProvider).value;
  final userId = user?.uid ?? 'test_user';

  final db = ref.watch(firestoreProvider);
  
  return db
      .collection('users')
      .doc(userId)
      .collection('targets')
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((snapshot) {
    return snapshot.docs.map((doc) => TargetModel.fromFirestore(doc)).toList();
  });
});

// Add Task function
Future<void> addTask(WidgetRef ref, String title, {bool isHabit = false}) async {
  final user = ref.read(authStateProvider).value;
  if (user == null) return;

  final db = ref.read(firestoreProvider);
  final tasksCollection = db.collection('users').doc(user.uid).collection('tasks');
  
  // Get current max order
  final snapshot = await tasksCollection.orderBy('order', descending: true).limit(1).get();
  int newOrder = 0;
  if (snapshot.docs.isNotEmpty) {
    newOrder = snapshot.docs.first.data()['order'] + 1;
  }

  final now = DateTime.now();
  final dateStr = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
  final id = tasksCollection.doc().id;

  final task = TaskModel(
    id: id,
    userId: user.uid,
    title: title,
    category: TaskCategory.other,
    isCompleted: false,
    isHabit: isHabit,
    date: dateStr,
    order: newOrder,
    createdAt: now.millisecondsSinceEpoch,
  );

  await tasksCollection.doc(id).set(task.toJson());
}

// Toggle Task
Future<void> toggleTask(WidgetRef ref, TaskModel task, bool completed) async {
  final user = ref.read(authStateProvider).value;
  if (user == null) return;

  final db = ref.read(firestoreProvider);
  final tasksCollection = db.collection('users').doc(user.uid).collection('tasks');
  
  final updatedTask = task.copyWith(
    isCompleted: completed,
    completedAt: completed ? DateTime.now().millisecondsSinceEpoch : null,
  );

  await tasksCollection.doc(task.id).set(updatedTask.toJson(), SetOptions(merge: true));
}

// Delete Task
Future<void> deleteTask(WidgetRef ref, String taskId) async {
  final user = ref.read(authStateProvider).value;
  if (user == null) return;

  final db = ref.read(firestoreProvider);
  await db.collection('users').doc(user.uid).collection('tasks').doc(taskId).delete();
}

// Add Target
Future<void> addTarget(WidgetRef ref, String title) async {
  final user = ref.read(authStateProvider).value;
  if (user == null) return;

  final db = ref.read(firestoreProvider);
  final targetsCollection = db.collection('users').doc(user.uid).collection('targets');
  
  final now = DateTime.now();
  final dateStr = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
  final id = targetsCollection.doc().id;

  final target = TargetModel(
    id: id,
    userId: user.uid,
    title: title,
    category: TargetCategory.learning,
    totalDays: 30,
    plan: [],
    completedDays: [],
    createdAt: now.millisecondsSinceEpoch,
    startDate: dateStr,
    status: TargetStatus.active,
  );

  await targetsCollection.doc(id).set(target.toJson());
}
