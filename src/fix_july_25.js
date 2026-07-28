import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.PRIMARY_FIREBASE_PROJECT_ID,
  clientEmail: process.env.PRIMARY_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.PRIMARY_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixJuly25() {
  const userId = 'Z5He3WABRbX0TV73wu1ouLcAgUg2';
  
  // Find "eat isabgol" on July 25
  const tasksRef = db.collection('users').doc(userId).collection('tasks');
  const snapshot = await tasksRef.where('date', '==', '2026-07-25').where('title', '==', 'eat isabgol').get();
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    await doc.ref.update({
      isCompleted: true,
      completedAt: Date.now()
    });
    console.log('Fixed eat isabgol for July 25');
  }

  // Also fix July 26 tasks so they get cloned properly later? No, just the July 25 record.
  
  // Update DayRecord for July 25
  const dayRecordRef = db.collection('users').doc(userId).collection('dayRecords').doc(`${userId}_2026-07-25`);
  const dayDoc = await dayRecordRef.get();
  
  if (dayDoc.exists) {
    const data = dayDoc.data();
    for (const t of data.tasks) {
      if (t.title === 'eat isabgol') {
        t.isCompleted = true;
        t.completedAt = Date.now();
      }
    }
    const completed = data.tasks.filter(t => t.isCompleted).length;
    const total = data.tasks.length;
    const pct = Math.round((completed / total) * 100);
    
    await dayRecordRef.update({
      tasks: data.tasks,
      completedTasks: completed,
      completionPercentage: pct,
      rating: pct >= 100 ? 'perfect' : pct >= 80 ? 'great' : pct >= 50 ? 'good' : pct >= 20 ? 'okay' : pct > 0 ? 'rough' : 'none'
    });
    console.log(`Updated July 25 record: ${completed}/${total} (${pct}%)`);
  }
}

fixJuly25().catch(console.error);
