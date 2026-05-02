/\*\*

- Backend Examples for Sending Push Notifications
-
- These are example functions for your backend/API to send notifications
- using Firebase Admin SDK
  \*/

import admin from "firebase-admin";

// Ensure Firebase Admin is initialized
// (This is typically done at your backend startup)

/\*\*

- Send notification to a specific user
  \*/
  export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  options?: {
  imageUrl?: string;
  data?: Record<string, string>;
  clickAction?: string;
  }
  ) {
  try {
  // Get user document to fetch their device tokens
  const userDoc = await admin.firestore().collection("users").doc(userId).get();

      if (!userDoc.exists) {
        console.warn("User not found:", userId);
        return { success: false, message: "User not found" };
      }

      const deviceTokens = userDoc.data()?.deviceTokens || [];

      if (deviceTokens.length === 0) {
        console.warn("No device tokens for user:", userId);
        return { success: false, message: "No device tokens found" };
      }

      // Send multicast message to all device tokens
      const message = {
        notification: {
          title,
          body,
          imageUrl: options?.imageUrl || "/logo.png",
        },
        data: options?.data || {},
        webpush: {
          fcmOptions: {
            link: options?.clickAction || "/",
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              badge: 1,
              sound: "default",
            },
          },
        },
        android: {
          priority: "high",
          notification: {
            clickAction: options?.clickAction || "/",
          },
        },
        tokens: deviceTokens,
      };

      const response = await admin.messaging().sendMulticast(message);

      console.log("✅ Notifications sent:", {
        success: response.successCount,
        failed: response.failureCount,
        tokens: deviceTokens.length,
      });

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const validTokens = deviceTokens.filter(
          (_, index) => !response.responses[index].error
        );

        if (validTokens.length !== deviceTokens.length) {
          await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .update({
              deviceTokens: validTokens,
              lastTokenUpdate: new Date(),
            });
          console.log("Updated device tokens for user:", userId);
        }
      }

      return { success: true, message: "Notifications sent successfully" };

  } catch (error) {
  console.error("Failed to send notification:", error);
  return { success: false, message: String(error) };
  }
  }

/\*\*

- Send notification to multiple users
  \*/
  export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  body: string
  ) {
  const results = await Promise.all(
  userIds.map((userId) => sendNotificationToUser(userId, title, body))
  );

const successCount = results.filter((r) => r.success).length;
console.log(`Sent notifications to ${successCount}/${userIds.length} users`);

return { successCount, totalUsers: userIds.length };
}

/\*\*

- Send notification to a topic (broadcast to all subscribers)
- Much more efficient than sending to individual tokens
  \*/
  export async function sendNotificationToTopic(
  topic: string,
  title: string,
  body: string,
  options?: {
  imageUrl?: string;
  data?: Record<string, string>;
  }
  ) {
  try {
  const message = {
  notification: {
  title,
  body,
  imageUrl: options?.imageUrl || "/logo.png",
  },
  data: options?.data || {},
  topic,
  webpush: {
  fcmOptions: {
  link: "/",
  },
  },
  apns: {
  payload: {
  aps: {
  alert: {
  title,
  body,
  },
  sound: "default",
  },
  },
  },
  android: {
  priority: "high",
  },
  };

      const response = await admin.messaging().send(message);

      console.log("✅ Topic notification sent:", {
        topic,
        messageId: response,
      });

      return { success: true, messageId: response };

  } catch (error) {
  console.error("Failed to send topic notification:", error);
  return { success: false, message: String(error) };
  }
  }

/\*\*

- Subscribe a user to a topic
- Topics are used for broadcasting to groups of users
- Examples: "daily_reminders", "habit_alerts", "achievement_unlocked"
  \*/
  export async function subscribeUserToTopic(
  token: string,
  topic: string
  ): Promise<void> {
  await admin.messaging().subscribeToTopic([token], topic);
  console.log(`✅ Subscribed token to topic: ${topic}`);
  }

/\*\*

- Unsubscribe a user from a topic
  \*/
  export async function unsubscribeUserFromTopic(
  token: string,
  topic: string
  ): Promise<void> {
  await admin.messaging().unsubscribeFromTopic([token], topic);
  console.log(`✅ Unsubscribed token from topic: ${topic}`);
  }

/\*\*

- Save device token when user logs in
- Call this from your API route after successful authentication
  \*/
  export async function saveDeviceToken(userId: string, token: string) {
  try {
  const userRef = admin.firestore().collection("users").doc(userId);

      // Add token to array if not already present
      await userRef.update({
        deviceTokens: admin.firestore.FieldValue.arrayUnion(token),
        lastTokenUpdate: new Date(),
      });

      console.log("✅ Device token saved for user:", userId);
      return { success: true };

  } catch (error) {
  console.error("Failed to save device token:", error);
  return { success: false, message: String(error) };
  }
  }

/\*\*

- Example: Daily reminder notification (run with scheduler like Cloud Tasks)
  \*/
  export async function sendDailyReminders() {
  try {
  // Get all users who have notifications enabled
  const snapshot = await admin
  .firestore()
  .collection("users")
  .where("notificationsEnabled", "==", true)
  .get();

      console.log(`Sending reminders to ${snapshot.size} users...`);

      let sent = 0;
      for (const doc of snapshot.docs) {
        const userId = doc.id;
        const result = await sendNotificationToUser(
          userId,
          "Daily Reminder 📋",
          "Don't forget to check your tasks today! You can do this! 🚀"
        );

        if (result.success) sent++;
      }

      console.log(`✅ Daily reminders sent to ${sent} users`);
      return { success: true, sent };

  } catch (error) {
  console.error("Failed to send daily reminders:", error);
  return { success: false, message: String(error) };
  }
  }

/\*\*

- Example: Achievement notification
  \*/
  export async function notifyAchievementUnlocked(
  userId: string,
  achievementName: string,
  achievementDescription: string
  ) {
  return await sendNotificationToUser(
  userId,
  `🏆 Achievement Unlocked!`,
  `${achievementName}: ${achievementDescription}`,
  {
  imageUrl: "/achievements/badge.png",
  data: {
  type: "achievement",
  id: achievementName,
  },
  clickAction: "/achievements",
  }
  );
  }

/\*\*

- Example: Habit reminder
  \*/
  export async function notifyHabitReminder(
  userId: string,
  habitName: string
  ) {
  return await sendNotificationToUser(
  userId,
  "🎯 Habit Reminder",
  `Time to work on: ${habitName}`,
  {
  data: {
  type: "habit_reminder",
  habitName,
  },
  clickAction: "/today",
  }
  );
  }

// ========== API Route Examples ==========

/\*\*

- API endpoint to send notification (call this from frontend if allowed)
- Route: POST /api/notifications/send
  \*/
  export async function handleSendNotification(req: any, res: any) {
  if (req.method !== "POST") {
  return res.status(405).json({ error: "Method not allowed" });
  }

try {
const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await sendNotificationToUser(userId, title, body);
    return res.status(200).json(result);

} catch (error) {
return res.status(500).json({ error: String(error) });
}
}

/\*\*

- API endpoint to save device token
- Route: POST /api/notifications/register-token
- Call this from frontend when token is obtained
  \*/
  export async function handleRegisterToken(req: any, res: any) {
  if (req.method !== "POST") {
  return res.status(405).json({ error: "Method not allowed" });
  }

try {
const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: "Missing userId or token" });
    }

    const result = await saveDeviceToken(userId, token);
    return res.status(200).json(result);

} catch (error) {
return res.status(500).json({ error: String(error) });
}
}
