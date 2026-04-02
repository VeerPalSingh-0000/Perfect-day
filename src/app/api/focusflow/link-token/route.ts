import { NextResponse } from "next/server";
import {
  getPrimaryAdminAuth,
  getPrimaryAdminDb,
  getTrackerAdminAuth,
} from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

type GoogleTokenInfo = {
  sub: string;
  email?: string;
  email_verified?: string;
  exp?: string;
};

const allowedOrigins = new Set([
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
]);

const FOCUSFLOW_LINKS_COLLECTION = "focusflowLinks";

type FocusflowLinkBody = {
  trackerGoogleIdToken?: string;
  restoreOnly?: boolean;
};

const isAllowedOrigin = (origin: string | null): origin is string => {
  if (!origin) return false;
  if (allowedOrigins.has(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
};

const corsHeadersFor = (request: Request): HeadersInit => {
  const origin = request.headers.get("origin");
  const allowOrigin = isAllowedOrigin(origin) ? origin : "https://localhost";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    Vary: "Origin",
  };
};

type ErrorPayload = {
  success: false;
  message: string;
  code?: string;
};

const error = (
  request: Request,
  status: number,
  message: string,
  code?: string,
) =>
  NextResponse.json<ErrorPayload>(
    {
      success: false,
      message,
      ...(code ? { code } : {}),
    },
    { status, headers: corsHeadersFor(request) },
  );

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeadersFor(request),
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const bearerPrefix = "Bearer ";

    if (!authHeader.startsWith(bearerPrefix)) {
      return error(
        request,
        401,
        "Missing bearer token.",
        "missing_bearer_token",
      );
    }

    const primaryIdToken = authHeader.slice(bearerPrefix.length).trim();
    if (!primaryIdToken) {
      return error(request, 401, "Empty bearer token.", "empty_bearer_token");
    }

    const primaryAdminAuth = getPrimaryAdminAuth();
    const decoded = await primaryAdminAuth.verifyIdToken(primaryIdToken, true);

    if (!decoded?.uid) {
      return error(
        request,
        401,
        "Invalid primary auth token.",
        "invalid_primary_token",
      );
    }

    const body = await request.json().catch(() => ({}) as FocusflowLinkBody);

    let trackerUid = decoded.uid;
    let trackerEmail: string | undefined;
    let trackerEmailVerified: boolean | undefined;
    const restoreOnly = body?.restoreOnly === true;

    const primaryAdminDb = getPrimaryAdminDb();
    const linkRef = primaryAdminDb
      .collection(FOCUSFLOW_LINKS_COLLECTION)
      .doc(decoded.uid);
    const linkSnap = await linkRef.get();

    const trackerGoogleIdToken =
      typeof body?.trackerGoogleIdToken === "string"
        ? body.trackerGoogleIdToken.trim()
        : "";

    if (trackerGoogleIdToken.length > 0) {
      const tokenInfoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(trackerGoogleIdToken)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!tokenInfoResponse.ok) {
        return error(
          request,
          400,
          "Selected Google account token is invalid or expired.",
          "invalid_tracker_google_token",
        );
      }

      const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;
      if (!tokenInfo?.sub) {
        return error(
          request,
          400,
          "Selected Google account is missing identity subject.",
          "missing_tracker_google_sub",
        );
      }

      trackerUid = tokenInfo.sub;
      trackerEmail =
        typeof tokenInfo.email === "string" && tokenInfo.email.length > 0
          ? tokenInfo.email
          : undefined;
      trackerEmailVerified = tokenInfo.email_verified === "true";
    } else if (linkSnap.exists) {
      const linkData = linkSnap.data() as
        | {
            trackerUid?: string;
            trackerEmail?: string;
          }
        | undefined;

      if (typeof linkData?.trackerUid === "string" && linkData.trackerUid) {
        trackerUid = linkData.trackerUid;
      }
      if (typeof linkData?.trackerEmail === "string" && linkData.trackerEmail) {
        trackerEmail = linkData.trackerEmail;
      }
    } else if (restoreOnly) {
      return error(
        request,
        404,
        "No FocusFlow link found for this account.",
        "focusflow_not_linked",
      );
    }

    const trackerAdminAuth = getTrackerAdminAuth();

    // If the selected Gmail already exists in tracker auth, reuse its real tracker UID.
    if (trackerEmail) {
      try {
        const existingTrackerUser =
          await trackerAdminAuth.getUserByEmail(trackerEmail);
        trackerUid = existingTrackerUser.uid;
      } catch {
        // Ignore "user-not-found" here; fallback to token subject below.
      }
    }

    // Ensure tracker user record has email for UI display and rule compatibility.
    if (trackerEmail) {
      try {
        await trackerAdminAuth.updateUser(trackerUid, {
          email: trackerEmail,
          emailVerified: trackerEmailVerified ?? false,
        });
      } catch {
        await trackerAdminAuth.createUser({
          uid: trackerUid,
          email: trackerEmail,
          emailVerified: trackerEmailVerified ?? false,
        });
      }
    }

    // Persist link so other devices can restore silently.
    await linkRef.set(
      {
        primaryUid: decoded.uid,
        primaryEmail:
          typeof decoded.email === "string" && decoded.email.length > 0
            ? decoded.email
            : null,
        trackerUid,
        trackerEmail: trackerEmail ?? null,
        updatedAt: Date.now(),
      },
      { merge: true },
    );

    const customClaims: Record<string, string | boolean> = {
      linkedByPrimaryUid: decoded.uid,
    };

    if (typeof decoded.email === "string" && decoded.email.length > 0) {
      customClaims.primaryEmail = decoded.email;
    }

    if (typeof trackerEmail === "string" && trackerEmail.length > 0) {
      customClaims.email = trackerEmail;
      customClaims.trackerEmail = trackerEmail;
    } else if (typeof decoded.email === "string" && decoded.email.length > 0) {
      customClaims.email = decoded.email;
    }

    if (typeof trackerEmailVerified === "boolean") {
      customClaims.email_verified = trackerEmailVerified;
    }

    const trackerCustomToken = await trackerAdminAuth.createCustomToken(
      trackerUid,
      customClaims,
    );

    return NextResponse.json(
      {
        success: true,
        customToken: trackerCustomToken,
        trackerEmail: trackerEmail ?? null,
        trackerUid,
      },
      { status: 200, headers: corsHeadersFor(request) },
    );
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to create link token.";
    return error(request, 500, message, "link_token_failed");
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const bearerPrefix = "Bearer ";

    if (!authHeader.startsWith(bearerPrefix)) {
      return error(
        request,
        401,
        "Missing bearer token.",
        "missing_bearer_token",
      );
    }

    const primaryIdToken = authHeader.slice(bearerPrefix.length).trim();
    if (!primaryIdToken) {
      return error(request, 401, "Empty bearer token.", "empty_bearer_token");
    }

    const primaryAdminAuth = getPrimaryAdminAuth();
    const decoded = await primaryAdminAuth.verifyIdToken(primaryIdToken, true);

    if (!decoded?.uid) {
      return error(
        request,
        401,
        "Invalid primary auth token.",
        "invalid_primary_token",
      );
    }

    const primaryAdminDb = getPrimaryAdminDb();
    await primaryAdminDb
      .collection(FOCUSFLOW_LINKS_COLLECTION)
      .doc(decoded.uid)
      .delete();

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200, headers: corsHeadersFor(request) },
    );
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to unlink FocusFlow account.";
    return error(request, 500, message, "focusflow_unlink_failed");
  }
}
