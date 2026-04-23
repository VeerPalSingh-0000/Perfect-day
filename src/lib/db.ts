import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { Task, DayRecord, UserProfile, LearningTarget } from "../types";
import { calculateDayRating } from "./utils";
import { logError, createSafeErrorMessage } from "./errorHandler";
import { trackerDb } from "./tracker-db";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await sleep(300 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

// User Profile Management
export const listenToUserProfile = (
  userId: string,
  callback: (profile: UserProfile | null) => void,
): (() => void) => {
  if (!userId) return () => {};

  const userRef = doc(db, "users", userId);
  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      logError(
        "profileOperation",
        error,
        createSafeErrorMessage("profileOperation"),
      );
    },
  );
};

export const getUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  if (!userId) return null;
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    logError(
      "profileOperation",
      error,
      createSafeErrorMessage("profileOperation"),
    );
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>,
) => {
  if (!userId) throw new Error("userId is required");
  try {
    const userRef = doc(db, "users", userId);
    await withRetry(() => setDoc(userRef, updates, { merge: true }));
  } catch (error) {
    logError(
      "profileOperation",
      error,
      createSafeErrorMessage("profileOperation"),
    );
    throw error;
  }
};

export const addTask = async (task: Task) => {
  if (!task || !task.userId || !task.id) {
    throw new Error("Invalid task data provided");
  }
  try {
    const taskRef = doc(db, "users", task.userId, "tasks", task.id);
    await withRetry(() => setDoc(taskRef, task));
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};

export const updateTask = async (
  userId: string,
  taskId: string,
  updates: Partial<Task>,
) => {
  if (!userId || !taskId) {
    throw new Error("userId and taskId are required");
  }
  try {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await withRetry(() => updateDoc(taskRef, updates));
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};

export const deleteTask = async (userId: string, taskId: string) => {
  if (!userId || !taskId) {
    throw new Error("userId and taskId are required");
  }
  try {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await withRetry(() => deleteDoc(taskRef));
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};

// Fetch all tasks for a specific date (YYYY-MM-DD)
export const getTasksByDate = async (
  userId: string,
  date: string,
): Promise<Task[]> => {
  if (!userId || !date) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("getTasksByDate called with missing userId or date");
    }
    return [];
  }

  try {
    const tasksRef = collection(db, "users", userId, "tasks");
    const q = query(tasksRef, where("date", "==", date));

    const snapshot = await getDocs(q);
    const tasks: Task[] = [];
    snapshot.forEach((docSnap) => {
      const taskData = docSnap.data() as Task;
      if (taskData) tasks.push(taskData);
    });

    return tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    logError("dataFetch", error, createSafeErrorMessage("dataFetch"));
    return [];
  }
};

// Fetch all habit tasks (for auto-seeding on new days)
export const getHabitTasks = async (userId: string): Promise<Task[]> => {
  if (!userId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("getHabitTasks called with missing userId");
    }
    return [];
  }

  try {
    const tasksRef = collection(db, "users", userId, "tasks");
    const q = query(tasksRef, where("isHabit", "==", true));

    const snapshot = await getDocs(q);
    const tasks: Task[] = [];
    const seenTitles = new Set<string>();

    const rawTasks: Task[] = [];
    snapshot.forEach((docSnap) => rawTasks.push(docSnap.data() as Task));

    // Sort descending by date so if a user edits a habit today, we copy those newest settings.
    rawTasks.sort((a, b) => b.date.localeCompare(a.date));

    rawTasks.forEach((taskData) => {
      // Deduplicate by title+category (habits repeat daily, so many exist)
      const key = `${taskData.title}__${taskData.category}`;
      if (taskData && !seenTitles.has(key)) {
        seenTitles.add(key);
        tasks.push(taskData);
      }
    });

    return tasks;
  } catch (error) {
    logError("dataFetch", error, createSafeErrorMessage("dataFetch"));
    return [];
  }
};

// Save a daily snapshot
export const saveDayRecord = async (record: DayRecord) => {
  if (!record || !record.userId || !record.id) {
    throw new Error("Invalid record data provided");
  }
  try {
    const recordRef = doc(db, "users", record.userId, "dayRecords", record.id);
    await withRetry(() => setDoc(recordRef, record));
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};

export const getDayRecords = async (
  userId: string,
  limitDays: number = 30,
): Promise<DayRecord[]> => {
  if (!userId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("getDayRecords called with missing userId");
    }
    return [];
  }

  try {
    const recordsRef = collection(db, "users", userId, "dayRecords");
    const snapshot = await getDocs(recordsRef);
    const records: DayRecord[] = [];
    snapshot.forEach((docSnap) => {
      const recordData = docSnap.data() as DayRecord;
      if (recordData) records.push(recordData);
    });
    return records
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limitDays);
  } catch (error) {
    logError("dataFetch", error, createSafeErrorMessage("dataFetch"));
    return [];
  }
};

// Recovery: rebuild dayRecords from tasks if records are missing.
export const rebuildDayRecordsFromTasks = async (
  userId: string,
): Promise<number> => {
  if (!userId) return 0;

  try {
    const tasksRef = collection(db, "users", userId, "tasks");
    const snapshot = await getDocs(tasksRef);
    const byDate = new Map<string, Task[]>();

    snapshot.forEach((docSnap) => {
      const task = docSnap.data() as Task;
      if (!task?.date) return;
      const existing = byDate.get(task.date) || [];
      existing.push(task);
      byDate.set(task.date, existing);
    });

    if (byDate.size === 0) return 0;

    let rebuilt = 0;
    for (const [date, tasks] of byDate.entries()) {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.isCompleted).length;
      const completionPercentage =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      const record: DayRecord = {
        id: `${userId}_${date}`,
        userId,
        date,
        totalTasks,
        completedTasks,
        completionPercentage,
        rating: calculateDayRating(completionPercentage),
        tasks,
        createdAt: Math.max(...tasks.map((t) => t.createdAt || 0), Date.now()),
      };

      const recordRef = doc(db, "users", userId, "dayRecords", record.id);
      await setDoc(recordRef, record, { merge: true });
      rebuilt++;
    }

    return rebuilt;
  } catch (error) {
    console.error("Error rebuilding day records:", error);
    return 0;
  }
};

// Production recovery: if same Gmail ended up with a different UID on another platform,
// migrate historical data from old UID buckets to the current UID.
export const migrateUserDataByEmail = async (
  currentUid: string,
  email?: string | null,
): Promise<{ migrated: boolean; tasks: number; records: number }> => {
  if (!currentUid || !email) return { migrated: false, tasks: 0, records: 0 };

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const usersSnap = await getDocs(q);

    const sourceUids = usersSnap.docs
      .map((d) => d.id)
      .filter((uid) => uid && uid !== currentUid);

    if (sourceUids.length === 0) {
      return { migrated: false, tasks: 0, records: 0 };
    }

    let migratedTasks = 0;
    let migratedRecords = 0;

    for (const sourceUid of sourceUids) {
      const sourceTasksRef = collection(db, "users", sourceUid, "tasks");
      const sourceRecordsRef = collection(db, "users", sourceUid, "dayRecords");

      const [tasksSnap, recordsSnap] = await Promise.all([
        getDocs(sourceTasksRef),
        getDocs(sourceRecordsRef),
      ]);

      for (const taskDoc of tasksSnap.docs) {
        const task = taskDoc.data() as Task;
        const targetTaskRef = doc(db, "users", currentUid, "tasks", taskDoc.id);
        await setDoc(
          targetTaskRef,
          {
            ...task,
            userId: currentUid,
          },
          { merge: true },
        );
        migratedTasks++;
      }

      for (const recordDoc of recordsSnap.docs) {
        const record = recordDoc.data() as DayRecord;
        const targetRecordRef = doc(
          db,
          "users",
          currentUid,
          "dayRecords",
          recordDoc.id,
        );
        await setDoc(
          targetRecordRef,
          {
            ...record,
            userId: currentUid,
          },
          { merge: true },
        );
        migratedRecords++;
      }
    }

    return {
      migrated: migratedTasks > 0 || migratedRecords > 0,
      tasks: migratedTasks,
      records: migratedRecords,
    };
  } catch (error) {
    console.error("Error migrating user data by email:", error);
    return { migrated: false, tasks: 0, records: 0 };
  }
};

// Real-time listener for tasks — Instantly returns local cache, then syncs server!
export const listenToTasksByDate = (
  userId: string,
  date: string,
  callback: (tasks: Task[]) => void,
) => {
  if (!userId || !date) return () => {};

  const tasksRef = collection(db, "users", userId, "tasks");
  const q = query(tasksRef, where("date", "==", date));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = [];
      const seenIds = new Set<string>();
      snapshot.forEach((docSnap) => {
        const taskData = docSnap.data() as Task;
        if (taskData && !seenIds.has(taskData.id)) {
          seenIds.add(taskData.id);
          tasks.push(taskData);
        }
      });
      callback(tasks.sort((a, b) => (a.order || 0) - (b.order || 0)));
    },
    (error) => {
      logError("dataFetch", error, createSafeErrorMessage("dataFetch"));
    },
  );
};

// Real-time listener for records
export const listenToDayRecords = (
  userId: string,
  callback: (records: DayRecord[]) => void,
) => {
  if (!userId) return () => {};

  const recordsRef = collection(db, "users", userId, "dayRecords");

  return onSnapshot(
    recordsRef,
    (snapshot) => {
      const records: DayRecord[] = [];
      snapshot.forEach((docSnap) => {
        const recordData = docSnap.data() as DayRecord;
        if (recordData) records.push(recordData);
      });
      callback(records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    },
    (error) => {
      logError("dataFetch", error, createSafeErrorMessage("dataFetch"));
    },
  );
};

// Listen to TrackIT sessions for a specific user ID
export const listenToTrackItSessions = (
  trackerUid: string,
  onNewSession: (session: any) => void,
) => {
  if (!trackerUid) return () => {};

  // Track the last processed session time to only react to NEW sessions
  // We use a small 2-second buffer to make sure we don't skip sessions
  // that were saved right as the listener was starting.
  let lastProcessedTime = Date.now() - 2000;

  const sessionsRef = collection(trackerDb, "sessions");
  const q = query(sessionsRef, where("userId", "==", trackerUid));

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const session = change.doc.data();
        const sessionTime = session.createdAt?.toMillis() || Date.now();

        console.log(
          "TrackIT Session Detected:",
          session.projectName,
          "IDs:",
          [session.projectId, session.topicId, session.subTopicId].filter(
            Boolean,
          ),
        );

        // Only trigger for sessions added AFTER we started listening
        if (sessionTime > lastProcessedTime) {
          onNewSession(session);
        }
      }
    });
  });
};

// Fetch ALL linkable items from TrackIT (projects + nested topics + subtopics)
// TrackIT stores topics/subtopics as nested arrays INSIDE each project document.
// Structure: project.topics = [{ id, name, subTopics: [{ id, name }] }]
export const getTrackItProjects = async (trackerUid: string) => {
  if (!trackerUid) return [];
  const projectsRef = collection(trackerDb, "projects");
  const q = query(projectsRef, where("userId", "==", trackerUid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Extract topics + subtopics from project docs (they are nested, not a separate collection)
export const getTrackItTopics = async (trackerUid: string) => {
  if (!trackerUid) return [];
  const projects = await getTrackItProjects(trackerUid);
  const items: any[] = [];
  projects.forEach((proj: any) => {
    if (proj.topics && Array.isArray(proj.topics)) {
      proj.topics.forEach((topic: any) => {
        items.push({
          id: topic.id,
          name: topic.name,
          type: "topic",
          projectName: proj.name,
        });
        if (topic.subTopics && Array.isArray(topic.subTopics)) {
          topic.subTopics.forEach((sub: any) => {
            items.push({
              id: sub.id,
              name: sub.name,
              type: "subtopic",
              projectName: proj.name,
              topicName: topic.name,
            });
          });
        }
      });
    }
  });
  return items;
};

// Batch update task orders
export const reorderTasks = async (
  userId: string,
  taskOrders: { id: string; order: number }[],
) => {
  if (!userId || !taskOrders.length) return;

  try {
    const batches = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;

    for (const { id, order } of taskOrders) {
      const taskRef = doc(db, "users", userId, "tasks", id);
      currentBatch.update(taskRef, { order });
      opCount++;

      if (opCount === 500) {
        batches.push(currentBatch.commit());
        currentBatch = writeBatch(db);
        opCount = 0;
      }
    }

    if (opCount > 0) {
      batches.push(currentBatch.commit());
    }

    await Promise.all(batches);
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};

// Clean up duplicate tasks for a specific date
export const cleanupDuplicateTasksForDate = async (
  userId: string,
  date: string,
): Promise<number> => {
  if (!userId || !date) return 0;

  try {
    const tasksRef = collection(db, "users", userId, "tasks");
    const q = query(tasksRef, where("date", "==", date));

    const snapshot = await getDocs(q);
    const tasks: Task[] = [];
    const duplicateIds: string[] = [];
    const seenKeys = new Set<string>();

    // Collect all tasks and identify duplicates
    snapshot.forEach((docSnap) => {
      const taskData = docSnap.data() as Task;
      if (taskData) tasks.push(taskData);
    });

    // Find duplicates by title+category for habits, keeping only the first one
    tasks.forEach((task) => {
      const key = task.isHabit ? `${task.title}__${task.category}` : task.id;
      if (seenKeys.has(key)) {
        duplicateIds.push(task.id);
      } else {
        seenKeys.add(key);
      }
    });

    // Delete duplicate tasks
    if (duplicateIds.length > 0) {
      const batches = [];
      let currentBatch = writeBatch(db);
      let opCount = 0;

      for (const taskId of duplicateIds) {
        const taskRef = doc(db, "users", userId, "tasks", taskId);
        currentBatch.delete(taskRef);
        opCount++;

        if (opCount === 500) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          opCount = 0;
        }
      }

      if (opCount > 0) {
        batches.push(currentBatch.commit());
      }

      await Promise.all(batches);
      console.log(
        `Cleaned up ${duplicateIds.length} duplicate tasks for date ${date}`,
      );
      return duplicateIds.length;
    }

    return 0;
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    return 0;
  }
};

// --- TARGET SYNC FUNCTIONS ---

export const listenToTargets = (
  userId: string,
  callback: (targets: LearningTarget[]) => void
) => {
  if (!userId) return () => {};
  const targetsRef = collection(db, "users", userId, "targets");
  return onSnapshot(targetsRef, (snapshot) => {
    const targets: LearningTarget[] = [];
    snapshot.forEach((docSnap) => {
      targets.push(docSnap.data() as LearningTarget);
    });
    // Sort oldest first or however they were created
    callback(targets.sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0)));
  }, (error) => {
    logError("dataFetch", error, createSafeErrorMessage("dataFetch"));
  });
};

export const saveTarget = async (target: LearningTarget) => {
  if (!target || !target.userId || !target.id) throw new Error("Invalid target");
  try {
    const targetRef = doc(db, "users", target.userId, "targets", target.id);
    await withRetry(() => setDoc(targetRef, target));
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};

export const updateTargetInCloud = async (userId: string, targetId: string, updates: Partial<LearningTarget>) => {
  if (!userId || !targetId) throw new Error("Missing ID");
  try {
    const targetRef = doc(db, "users", userId, "targets", targetId);
    await withRetry(() => updateDoc(targetRef, updates));
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};

export const removeTargetFromCloud = async (userId: string, targetId: string) => {
  if (!userId || !targetId) throw new Error("Missing ID");
  try {
    const targetRef = doc(db, "users", userId, "targets", targetId);
    await withRetry(() => deleteDoc(targetRef));
  } catch (error) {
    logError("taskOperation", error, createSafeErrorMessage("taskOperation"));
    throw error;
  }
};
