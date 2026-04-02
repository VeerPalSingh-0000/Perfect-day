import { NextResponse } from "next/server";
import {
  getPrimaryAdminAuth,
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    const body = await request
      .json()
      .catch(() => ({}) as { trackerGoogleIdToken?: string });

    let trackerUid = decoded.uid;
    let trackerEmail: string | undefined;

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
    }

    const trackerAdminAuth = getTrackerAdminAuth();

    const customClaims: Record<string, string> = {
      linkedByPrimaryUid: decoded.uid,
    };

    if (typeof decoded.email === "string" && decoded.email.length > 0) {
      customClaims.primaryEmail = decoded.email;
    }

    if (typeof trackerEmail === "string" && trackerEmail.length > 0) {
      customClaims.trackerEmail = trackerEmail;
    }

    const trackerCustomToken = await trackerAdminAuth.createCustomToken(
      trackerUid,
      customClaims,
    );

    return NextResponse.json(
      {
        success: true,
        customToken: trackerCustomToken,
      },
      { status: 200, headers: corsHeadersFor(request) },
    );
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Failed to create link token.";
    return error(request, 500, message, "link_token_failed");
  }
}
