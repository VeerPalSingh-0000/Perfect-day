/**
 * SYNC DIAGNOSTIC UTILITY
 * Helps debug why cross-device sync isn't working
 *
 * Usage:
 * - Add this to a component or run in browser console
 * - It will show you exactly what UID you have and if migration can find other users
 */

export async function debugSyncIssues() {
  console.group("🔍 Perfect Day Sync Diagnostics");

  // Get current auth info
  const authState = JSON.parse(
    localStorage.getItem("auth-store") || "{}",
  )?.state;
  const currentUid = authState?.user?.uid;
  const currentEmail = authState?.user?.email;

  console.log("📱 Current Device:");
  console.log(`  UID: ${currentUid}`);
  console.log(`  Email: ${currentEmail}`);
  console.log(`  Auth Initialized: ${authState?.isInitialized}`);

  // Get cached data
  const dataState = JSON.parse(
    localStorage.getItem("perfect-day-data-store") || "{}",
  )?.state;
  console.log("\n💾 Cached Data (localStorage):");
  console.log(`  Tasks: ${dataState?.tasks?.length}`);
  console.log(`  Records: ${dataState?.records?.length}`);

  // Try to query for other users with same email
  console.log("\n🔐 Checking Firestore Rules...");
  console.log(
    "⚠️ If migration query fails below → Firestore rules are blocking it",
  );

  try {
    const { db } = await import("@/lib/firebase");
    const { collection, query, where, getDocs } =
      await import("firebase/firestore");

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", currentEmail));
    const usersSnap = await getDocs(q);

    console.log("\n✅ Migration Query Success!");
    console.log(
      `  Found ${usersSnap.docs.length} user(s) with email ${currentEmail}`,
    );
    usersSnap.docs.forEach((doc) => {
      console.log(
        `    - UID: ${doc.id} ${doc.id === currentUid ? "← You" : "← Other device"}`,
      );
    });
  } catch (error: any) {
    console.error("\n❌ Migration Query Failed!");
    console.error(`  Error: ${error.message}`);
    console.error(`  Reason: Firestore rules likely blocking the query`);
    console.error(`  This is why data isn't syncing across devices!`);
  }

  console.groupEnd();
}

// Export for console usage: window.debugSync = debugSyncIssues; then call debugSync()
