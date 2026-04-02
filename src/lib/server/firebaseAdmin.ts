import "server-only";

import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const PRIMARY_ADMIN_APP_NAME = "primary-admin";
const TRACKER_ADMIN_APP_NAME = "tracker-admin";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
};

const normalizePrivateKey = (raw: string): string => {
  const trimmed = raw.trim();

  // Support values saved with surrounding quotes in env providers.
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  return unquoted.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
};

const getOrInitAdminApp = (
  name: string,
  projectPrefix: "PRIMARY" | "TRACKER",
): App => {
  const existing = getApps().find((app) => app.name === name);
  if (existing) return existing;

  const projectId = requireEnv(`${projectPrefix}_FIREBASE_PROJECT_ID`);
  const clientEmail = requireEnv(`${projectPrefix}_FIREBASE_CLIENT_EMAIL`);
  const privateKey = normalizePrivateKey(
    requireEnv(`${projectPrefix}_FIREBASE_PRIVATE_KEY`),
  );

  return initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    },
    name,
  );
};

export const getPrimaryAdminAuth = () =>
  getAuth(getOrInitAdminApp(PRIMARY_ADMIN_APP_NAME, "PRIMARY"));

export const getTrackerAdminAuth = () =>
  getAuth(getOrInitAdminApp(TRACKER_ADMIN_APP_NAME, "TRACKER"));
