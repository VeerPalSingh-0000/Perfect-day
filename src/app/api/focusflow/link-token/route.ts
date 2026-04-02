import { NextResponse } from "next/server";
import {
  getPrimaryAdminAuth,
  getTrackerAdminAuth,
} from "@/lib/server/firebaseAdmin";

export const runtime = "nodejs";

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

    const trackerAdminAuth = getTrackerAdminAuth();
    const trackerUid = decoded.uid;

    const customClaims: Record<string, string> = {
      primaryUid: decoded.uid,
    };

    if (typeof decoded.email === "string" && decoded.email.length > 0) {
      customClaims.email = decoded.email;
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
