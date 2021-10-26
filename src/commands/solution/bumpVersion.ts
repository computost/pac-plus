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

const versionRegex = /<Version>([^<]*)<\/Version>/g;

export async function bumpSolutionVersion(options: BumpVersionOptions) {
  const { applicationId, folder, clientSecret, tenantId, url } = options;
  const action =
    options.action === "auto" ? await getAction(folder) : options.action;
  if (action === "skip") {
    return options;
  }

  const { webApi } = getApi(url!, {
    clientId: applicationId!,
    clientSecret: clientSecret!,
    tenantId: tenantId!,
  });

  const solutionXml = await getSolutionXml(folder);
  const currentVersion = getCurrentVersion(solutionXml);
  const nextVersion = getNextVersion(currentVersion, action);
  const updatedSolutionXml = setSolutionXmlVersion(solutionXml, nextVersion);
  await Promise.all([
    saveSolutionXml(options.folder, updatedSolutionXml),
    updateSolutionVersion(webApi, options.name, nextVersion),
  ]);

  return options;
}

function getCurrentVersion(xml: string) {
  const match = versionRegex.exec(xml);
  if (!match) {
    throw new Error("Could not find Version tag in Solution.xml");
  }
  const version = match[1];
  return version;
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
  const results = await webApi.retrieveMultipleRecords<Solution>(
    "solution",
    buildQuery<Solution>({
      select: ["version"],
      filter: [{ uniquename: name }],
      top: 1,
    })
  );
  const solution = results.entities[0];
  await webApi.updateRecord<Solution>("solution", solution.solutionid!, {
    version,
  });
}

async function getAction(folder: string) {
  const diffOutput = await git("diff", "--numstat", folder);
  if (diffOutput.trim().length === 0) {
    return "skip";
  } else {
    return "revision";
  }
}
