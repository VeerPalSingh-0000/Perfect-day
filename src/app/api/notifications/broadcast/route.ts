import { NextResponse } from "next/server";
import { getPrimaryAdminMessaging, getPrimaryAdminDb } from "@/lib/server/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // VERY IMPORTANT: Protect this endpoint with a secret key so only your cron job can hit it
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title || "Daily Check-in";
    const notificationBody = body.body || "Time to log your habits and track your day!";

    const db = getPrimaryAdminDb();
    
    // In a real scenario, you'd want to query users who have push_enabled: true
    // FCM tokens are stored at fcmToken field on the user document
    const usersSnapshot = await db.collection("users").get();
    
    let allTokens: string[] = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const data = userDoc.data();
      if (data.fcmToken) {
        allTokens.push(data.fcmToken);
      }
    }

    if (allTokens.length === 0) {
      return NextResponse.json(
        { message: "No users have registered device tokens." },
        { status: 200 }
      );
    }

    // FCM allows a maximum of 500 tokens per multicast message
    const chunkSize = 500;
    let successCount = 0;
    let failureCount = 0;
    
    const messaging = getPrimaryAdminMessaging();

    for (let i = 0; i < allTokens.length; i += chunkSize) {
      const chunk = allTokens.slice(i, i + chunkSize);
      
      const message = {
        notification: {
          title: title,
          body: notificationBody,
        },
        data: {
          click_action: "/",
        },
        tokens: chunk,
      };

      const response = await messaging.sendEachForMulticast(message);
      successCount += response.successCount;
      failureCount += response.failureCount;
    }

    return NextResponse.json({
      success: true,
      sentToTokens: allTokens.length,
      successCount,
      failureCount,
    });

  } catch (error) {
    console.error("Error broadcasting push notifications:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
