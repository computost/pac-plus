import { fetch } from "dataverse-api";
import { BumpVersionOptions } from "../../types/BumpVersionOptions.js";
import buildQuery from "odata-query";
import { Solution } from "../../types/Solution.js";

export async function bumpSolutionVersion(options: BumpVersionOptions) {
  const currentVersion = getCurrentVersion();

  async function getCurrentVersion() {
    if (options.currentVersion) {
      return options.currentVersion;
    }
    const response = await fetch(
      `solutions${buildQuery<Solution>({
        select: ["version"],
        filter: [{ uniquename: options.name }],
        top: 1,
      })}`
    );
    if (response.ok) {
      const solution = ((await response.json()) as any).value[0] as Solution;
      return solution.version;
    } else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }
}
