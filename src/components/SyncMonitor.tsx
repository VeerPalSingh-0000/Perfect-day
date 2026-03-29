/**
 * Real-time Sync Monitor Component
 * Shows sync status for debugging cross-device issues
 *
 * Add to your page component:
 * import { SyncMonitor } from '@/components/SyncMonitor';
 *
 * Then in JSX:
 * <SyncMonitor />
 */

"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/useDataStore";
import { use, useEffect, useState } from "react";

interface SyncStatus {
  currentUid: string;
  userEmail: string;
  tasksCount: number;
  recordsCount: number;
  isLocalDataLoaded: boolean;
  isMigrationPending: boolean;
  lastMigrationTime?: string;
}

export function SyncMonitor() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const authStore = useAuthStore();
  const dataStore = useDataStore();

  useEffect(() => {
    const status: SyncStatus = {
      currentUid: authStore.user?.uid || "unknown",
      userEmail: authStore.user?.email || "unknown",
      tasksCount: dataStore.tasks.length,
      recordsCount: dataStore.records.length,
      isLocalDataLoaded: dataStore.isDataLoaded,
      isMigrationPending:
        dataStore.records.length === 0 && dataStore.tasks.length > 0,
    };

    setSyncStatus(status);
  }, [
    authStore.user,
    dataStore.tasks,
    dataStore.records,
    dataStore.isDataLoaded,
  ]);

  if (!syncStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-xs rounded-lg border border-orange-500 bg-gray-900 p-3 text-xs text-gray-100 shadow-lg">
      <div className="mb-2 font-bold text-orange-400">📡 SYNC DEBUG</div>

      <div className="space-y-1 font-mono text-gray-300">
        <div>
          <span className="text-gray-400">UID:</span>{" "}
          {syncStatus.currentUid.slice(-8)}
        </div>
        <div>
          <span className="text-gray-400">Email:</span> {syncStatus.userEmail}
        </div>

        <div className="border-t border-gray-700 pt-1">
          <div className="text-cyan-400">
            📦 Tasks: <span>{syncStatus.tasksCount}</span>
          </div>
          <div className="text-cyan-400">
            📋 Records: <span>{syncStatus.recordsCount}</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-1">
          {syncStatus.isLocalDataLoaded ? (
            <div className="text-green-400">✅ Data Loaded</div>
          ) : (
            <div className="text-yellow-400">⏳ Loading...</div>
          )}
          {syncStatus.isMigrationPending && (
            <div className="text-yellow-400">⚠️ Checking for sync...</div>
          )}
        </div>

        <div className="border-t border-gray-700 pt-1 text-gray-500">
          <div className="text-xs">
            {syncStatus.tasksCount === 0 && syncStatus.recordsCount === 0
              ? "No data (New user or not synced)"
              : "Data present"}
          </div>
        </div>
      </div>

      <div className="mt-2 border-t border-gray-700 pt-2 text-xs">
        <button
          onClick={() => {
            console.log("Current Sync Status:", syncStatus);
            // You can add more debug info here
          }}
          className="rounded bg-orange-600 px-2 py-1 hover:bg-orange-500"
        >
          Log Debug Info
        </button>
      </div>
    </div>
  );
}
