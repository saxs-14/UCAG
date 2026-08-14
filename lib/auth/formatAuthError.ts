/**
 * Formats Firebase Auth error codes into clear, actionable, user-friendly messages.
 */
export function formatAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes("auth/unauthorized-domain")) {
    const origin = typeof window !== "undefined" ? window.location.hostname : "your domain";
    return `Firebase Authentication Error: Domain '${origin}' is not authorized for OAuth/Auth in your Firebase project. To fix this: Go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add '${origin}'.`;
  }

  if (message.includes("auth/invalid-credential") || message.includes("auth/user-not-found") || message.includes("auth/wrong-password")) {
    return "Invalid email or password. Please check your credentials and try again.";
  }

  if (message.includes("auth/email-already-in-use")) {
    return "An account with this email address already exists. Please sign in instead.";
  }

  if (message.includes("auth/weak-password")) {
    return "Password is too weak. Please choose a password with at least 6 characters.";
  }

  if (message.includes("auth/popup-closed-by-user")) {
    return "Sign-in window was closed before completing. Please try again.";
  }

  return message;
}
