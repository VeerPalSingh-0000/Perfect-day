/**
 * Secure Error Logging Utility
 * Sanitizes error messages in production to prevent information disclosure
 */

type ErrorContext =
  | "auth"
  | "database"
  | "dataFetch"
  | "taskOperation"
  | "profileOperation";

export const logError = (
  context: ErrorContext,
  error: unknown,
  userMessage: string = "An error occurred",
) => {
  // Full logging in development/staging
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${context}]`, error);
    return;
  }

  // Sanitized logging in production
  const timestamp = new Date().toISOString();
  const isFirebaseError =
    error instanceof Error &&
    (error.message.includes("Firebase") || error.message.includes("Firestore"));

  // Log to console (will be captured by error tracking service)
  console.error(`[${timestamp}] ${context}: ${userMessage}`);

  // Optional: Send to error tracking service (e.g., Sentry, LogRocket)
  // if (window.__errorTracker) {
  //   window.__errorTracker.captureException(error, {
  //     context,
  //     userMessage,
  //     sanitized: true,
  //   });
  // }
};

export const createSafeErrorMessage = (context: ErrorContext): string => {
  const messages: Record<ErrorContext, string> = {
    auth: "Authentication failed. Please try again.",
    database: "Failed to access data. Please refresh and try again.",
    dataFetch: "Failed to load your data. Please refresh the page.",
    taskOperation: "Failed to update task. Please try again.",
    profileOperation: "Failed to update profile. Please try again.",
  };

  return messages[context] || "An unexpected error occurred. Please try again.";
};

/**
 * Wraps an async function with error handling and logging
 */
export const withErrorHandling =
  <T extends any[], R>(fn: (...args: T) => Promise<R>, context: ErrorContext) =>
  async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(context, error, createSafeErrorMessage(context));
      return null;
    }
  };
