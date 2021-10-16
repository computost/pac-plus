import { AuthenticateOptions } from "../types/CreateAuthOptions.js";

export function isValidAuth(authOptions: AuthenticateOptions) {
  const hasAmbiguousCredentials =
    (authOptions.applicationId !== undefined ||
      authOptions.clientSecret !== undefined ||
      authOptions.tenantId !== undefined) &&
    (authOptions.password !== undefined || authOptions.username !== undefined);
  if (hasAmbiguousCredentials) {
    throw new Error(
      "Ambiguous credentials detected. Must supply either " +
        "(applicationId, clientSecret, and tenantId) or " +
        "(username and password)"
    );
  }

  const hasUrl = authOptions.url !== undefined;

  const hasClientCredentials =
    authOptions.applicationId !== undefined &&
    authOptions.clientSecret !== undefined &&
    authOptions.tenantId !== undefined;
  const hasBasicCredentials =
    authOptions.password !== undefined && authOptions.username !== undefined;
  const hasCredentials = hasClientCredentials || hasBasicCredentials;

  const isValid = hasUrl && hasCredentials;
  if (isValid) {
    return true;
  } else {
    if (hasUrl || hasCredentials) {
      throw new Error(
        "Incomplete credentials detected. " +
          "Must supply both url and credential set."
      );
    }
  }
}
