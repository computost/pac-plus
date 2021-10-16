import { AuthenticateOptions } from "../../types/CreateAuthOptions.js";
import { createAuth, selectAuth } from "pac-wrap";
import { isValidAuth } from "../../util/isValidAuth.js";
import { partialCopy } from "../../util/partialCopy.js";
import { generateRandomString } from "../../util/generateRandomString.js";

let currentAuthProfile: string | undefined = undefined;
const authProfiles: AuthProfileCache = {};

export async function authenticate(options: AuthenticateOptions) {
  const authOptions = partialCopy(options, [
    "applicationId",
    "clientSecret",
    "cloud",
    "password",
    "tenantId",
    "url",
    "username",
  ]);
  const authHash = JSON.stringify(authOptions);
  if (authHash in authProfiles) {
    const profileName = authProfiles[authHash];
    if (currentAuthProfile === profileName) {
      return;
    } else {
      currentAuthProfile = profileName;
      await selectAuth({ name: profileName });
    }
  } else {
    const profileName = generateRandomString();
    currentAuthProfile =
      authProfiles[authHash] =
      authOptions.name =
        profileName;
    if (isValidAuth(authOptions)) {
      await createAuth(authOptions);
    }
  }
}

interface AuthProfileCache {
  [key: string]: string;
}
