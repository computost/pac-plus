import { AuthenticateOptions } from "../../types/AuthenticateOptions.js";
import { createAuth, selectAuth } from "pac-wrap";
import { isValidAuth } from "../../util/isValidAuth.js";
import { partialCopy } from "../../util/partialCopy.js";
import { generateRandomString } from "../../util/generateRandomString.js";
import { CommandConfig } from "../../types/CommandConfig.js";

let currentAuthProfile: string | undefined = undefined;
const authProfiles: AuthProfileCache = {};

export async function authenticate(
  options: AuthenticateOptions
): Promise<void> {
  const authOptions: PacAuthenticateOptions = partialCopy(options, [
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
    if (currentAuthProfile !== profileName) {
      currentAuthProfile = profileName;
      await selectAuth({ name: profileName });
    }
  } else {
    const profileName = options.name ?? generateRandomString();
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

export const authenticateCommandConfig: CommandConfig<AuthenticateOptions> = {
  name: "authenticate",
  action: authenticate,
  description:
    "Create and store an authentication profile on this computer. " +
    "Caches profiles, and if one already exists with the given credentials, " +
    "it will be selected.",
  options: [
    {
      abbreviation: "n",
      name: "name",
      description:
        "The name you want to give to this authentication profile (maximum 12 characters)",
    },
    {
      abbreviation: "u",
      name: "url",
      description: "The resource URL to connect to",
    },
    {
      abbreviation: "un",
      name: "username",
      description: "The username to authenticate with",
    },
    {
      abbreviation: "p",
      name: "password",
      description: "The username to authenticate with",
    },
    {
      abbreviation: "id",
      name: "applicationId",
      description: "The application id to authenticate with",
    },
    {
      abbreviation: "cs",
      name: "clientSecret",
      description: "The client secret to authenticate with.",
    },
    {
      abbreviation: "t",
      name: "tenantId",
      description: "Tenant id if using application id & secret.",
    },
    {
      abbreviation: "ci",
      name: "cloud",
      description:
        "The cloud instance to authenticate with." +
        "Values: Public, Tip1, Tip2, UsGov, UsGovHigh, UsGovDod",
    },
  ],
};

type PacAuthenticateOptions = Parameters<typeof createAuth>[0];
