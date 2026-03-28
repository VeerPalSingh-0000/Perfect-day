import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Task, DayRecord } from "../types";

export const addTask = async (task: Task) => {
  if (!task || !task.userId || !task.id) {
    throw new Error("Invalid task data provided");
  }
  try {
    const taskRef = doc(db, "users", task.userId, "tasks", task.id);
    await setDoc(taskRef, task);
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

export const updateTask = async (
  userId: string,
  taskId: string,
  updates: Partial<Task>
) => {
  if (!userId || !taskId) {
    throw new Error("userId and taskId are required");
  }
  try {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, updates);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (userId: string, taskId: string) => {
  if (!userId || !taskId) {
    throw new Error("userId and taskId are required");
  }
  try {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Fetch all tasks for a specific date (YYYY-MM-DD)
export const getTasksByDate = async (
  userId: string,
  date: string
): Promise<Task[]> => {
  if (!userId || !date) {
    console.warn("getTasksByDate called with missing userId or date");
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
    console.error("Error fetching tasks by date:", error);
    return [];
  }
};

// Fetch all habit tasks (for auto-seeding on new days)
export const getHabitTasks = async (userId: string): Promise<Task[]> => {
  if (!userId) {
    console.warn("getHabitTasks called with missing userId");
    return [];
  }

  try {
    const tasksRef = collection(db, "users", userId, "tasks");
    const q = query(tasksRef, where("isHabit", "==", true));

    const snapshot = await getDocs(q);
    const tasks: Task[] = [];
    const seenTitles = new Set<string>();

    snapshot.forEach((docSnap) => {
      const taskData = docSnap.data() as Task;
      // Deduplicate by title+category (habits repeat daily, so many exist)
      const key = `${taskData.title}__${taskData.category}`;
      if (taskData && !seenTitles.has(key)) {
        seenTitles.add(key);
        tasks.push(taskData);
      }
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching habit tasks:", error);
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
    await setDoc(recordRef, record);
  } catch (error) {
    console.error("Error saving day record:", error);
    throw error;
  }
};

export const getDayRecords = async (
  userId: string,
  limitDays: number = 30
): Promise<DayRecord[]> => {
  if (!userId) {
    console.warn("getDayRecords called with missing userId");
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
    console.error("Error fetching day records:", error);
    return [];
  }
};
