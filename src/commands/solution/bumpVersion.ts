import odataQuery from "odata-query";
const buildQuery = (odataQuery as any).default as typeof odataQuery;
import { BumpVersionOptions } from "../../types/BumpVersionOptions.js";
import { Solution } from "../../types/Solution.js";
import { getApi } from "../../util/getApi.js";
import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { BumpAction } from "../../types/BumpAction.js";
import { WebApi } from "xrm-webapi-node/dist/types/WebApi";
import { git } from "../../util/git.js";
import { Credentials } from "xrm-webapi-node/dist/types/Credentials.js";
import { unpackSolution, unpackSolutionCommandConfig } from "./unpack.js";
import { CommandConfig } from "../../types/CommandConfig.js";
import { transformCommandConfigOptions } from "../../util/transformCommandConfigOptions.js";

const versionRegex = /<Version>([^<]*)<\/Version>/g;

export async function bumpSolutionVersion(
  options: BumpVersionOptions
): Promise<boolean> {
  let folder: string | undefined;
  let didUnpack: boolean;
  if (
    ("skipUnpack" in options && options.skipUnpack) ||
    !("name" in options || "zipFile" in options)
  ) {
    didUnpack = false;
    if ("folder" in options) {
      folder = options.folder;
    } else {
      folder = undefined;
    }
  } else {
    folder = await unpackSolution(options);
    didUnpack = true;
  }

  const action =
    options.action === undefined || options.action === "auto"
      ? folder && didUnpack
        ? await getAction(folder)
        : "revision"
      : options.action;
  if (action === "skip") {
    return false;
  }

  const promises: Promise<void>[] = [];
  let nextVersion: string | undefined = undefined;

  if (folder) {
    const solutionXml = await getSolutionXml(folder);
    const currentVersion = getCurrentVersion(solutionXml);
    nextVersion = getNextVersion(currentVersion, action);
    const updatedSolutionXml = setSolutionXmlVersion(solutionXml, nextVersion);
    promises.push(saveSolutionXml(folder, updatedSolutionXml));
  }

  if ("name" in options && options.name !== undefined) {
    const {
      applicationId,
      clientSecret,
      name,
      password,
      tenantId,
      url,
      username,
    } = options;
    const { webApi } = getApi(url!, {
      clientId: applicationId,
      clientSecret,
      password,
      tenantId,
      username,
    } as Credentials);
    if (nextVersion === undefined) {
      promises.push(
        (async () => {
          const currentVersion = await getCurrentVersion(webApi, name);
          const nextVersion = getNextVersion(currentVersion, action);
          await updateSolutionVersion(webApi, name, nextVersion);
        })()
      );
    } else {
      promises.push(updateSolutionVersion(webApi, name, nextVersion));
    }
  }

  await Promise.all(promises);

  return true;
}

function getCurrentVersion(xml: string): string;
function getCurrentVersion(webApi: WebApi, name: string): Promise<string>;
function getCurrentVersion(arg0: string | WebApi, name?: string) {
  if (typeof arg0 === "string") {
    const xml = arg0;
    const match = versionRegex.exec(xml);
    if (!match) {
      throw new Error("Could not find Version tag in Solution.xml");
    }
    const version = match[1];
    return version;
  } else {
    const webApi = arg0;
    return (async () => {
      const solution = await getSolution(webApi, name!);
      return solution.version!;
    })();
  }
}

const versionNumberIndexMap: { [key in BumpAction]: number } = {
  major: 0,
  minor: 1,
  build: 2,
  revision: 3,
};
function getNextVersion(version: string, action: BumpAction) {
  const stringParts = version.split(".");
  const numParts = stringParts.map((num) => parseInt(num));
  const bumpIndex = versionNumberIndexMap[action];
  numParts[bumpIndex]++;
  for (let i = bumpIndex + 1; i < numParts.length; i++) {
    numParts[i] = 0;
  }
  const nextVersion = numParts.join(".");
  return nextVersion;
}

async function getSolutionXml(folder: string) {
  const path = getSolutionXmlPath(folder);
  const xml = (await readFile(path)).toString();
  return xml;
}

function setSolutionXmlVersion(xml: string, version: string): string {
  const updatedXml = xml.replace(versionRegex, `<Version>${version}</Version>`);
  return updatedXml;
}

async function saveSolutionXml(folder: string, xml: string) {
  const path = getSolutionXmlPath(folder);
  await writeFile(path, xml);
}

function getSolutionXmlPath(folder: string) {
  const path = join(folder, "Other", "Solution.xml");
  return path;
}

async function updateSolutionVersion(
  webApi: WebApi,
  name: string,
  version: string
) {
  const solution = await getSolution(webApi, name);
  await webApi.updateRecord<Solution>("solution", solution.solutionid!, {
    version,
  });
}

async function getSolution(webApi: WebApi, name: string) {
  const results = await webApi.retrieveMultipleRecords<Solution>(
    "solution",
    buildQuery<Solution>({
      select: ["version"],
      filter: [{ uniquename: name }],
      top: 1,
    })
  );
  const solution = results.entities[0];
  return solution;
}

async function getAction(folder: string) {
  const outputs = await Promise.all([
    git("diff", "--numstat", folder),
    git("ls-files", "--others", folder),
  ]);
  if (outputs.every((output) => output.trim().length === 0)) {
    return "skip";
  } else {
    return "revision";
  }
}

export const bumpSolutionVersionCommandConfig: CommandConfig<
  BumpVersionOptions,
  boolean
> = {
  name: "bumpVersion",
  action: bumpSolutionVersion,
  description:
    "Increases the version number of a solution in source control and in a target environment.",
  options: [
    ...transformCommandConfigOptions(unpackSolutionCommandConfig.options, {
      edits: {
        name: {
          description: "The name of the solution to version-bump",
          required: false,
        },
      },
    }),
    {
      name: "action",
      abbreviation: "ac",
      description:
        "Determines which digit of the version to update. " +
        "Options are auto, major, minor, build, and revision. " +
        '"auto" will auto-detect whether or not to bump the version based whether any changes were detected after unpacking, ' +
        'or if --skipUnpack is set, "auto" will default to "revision". ' +
        "default: auto.",
    },
    {
      name: "skipUnpack",
      abbreviation: "su",
      description:
        "Skips exporting / unpacking the solution prior to bumping its version.",
      type: "flag",
    },
  ],
};
