import { NextResponse } from "next/server";
import { getPrimaryAdminMessaging, getPrimaryAdminDb } from "@/lib/server/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, body: notificationBody, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // 1. Fetch user's token from Firestore
    const db = getPrimaryAdminDb();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const token = userDoc.data()?.fcmToken;

    if (!token) {
      return NextResponse.json(
        { message: "No FCM tokens found for user" },
        { status: 404 }
      );
    }

    const tokens = [token];

    // 2. Prepare the messaging payload
    const message = {
      notification: {
        title: title || "Perfect Day Reminder",
        body: notificationBody || "Time to focus on your tasks!",
      },
      data: {
        click_action: "/",
        ...data,
      },
      tokens: tokens,
    };

    // 3. Send the notification
    const messaging = getPrimaryAdminMessaging();
    const response = await messaging.sendEachForMulticast(message);

    // Optional: clean up invalid tokens
    const failedTokens: string[] = [];
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      console.warn("Failed to send to some tokens:", failedTokens);
    }

    return NextResponse.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    });

  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
