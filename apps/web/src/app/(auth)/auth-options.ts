import "server-only";
import { api } from "@/shared/api/server";
import type { AuthOptions } from "@/shared/auth-client";

const FALLBACK: AuthOptions = { signUpEnabled: true, googleEnabled: false, emailVerificationRequired: false };

/** What this installation offers at sign-in (public; no session needed). */
export async function getAuthOptions(): Promise<AuthOptions> {
  try {
    return await api<AuthOptions>("/auth-options");
  } catch (error) {
    // Next's redirect() is control flow and must propagate.
    if (error && typeof error === "object" && "digest" in error) throw error;
    return FALLBACK;
  }
}
