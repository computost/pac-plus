import { exportSolution as pacExportSolution } from "pac-wrap";
import { join } from "path";
import { CommandConfig } from "../../types/CommandConfig.js";
import { ExportOptions } from "../../types/ExportOptions.js";
import { PacResponse } from "../../types/PacResponse.js";
import { createTempDir } from "../../util/createTempDir.js";
import { partialCopy } from "../../util/partialCopy.js";
import { transformCommandConfigOptions } from "../../util/transformCommandConfigOptions.js";
import {
  authenticate,
  authenticateCommandConfig,
} from "../auth/authenticate.js";

export async function exportSolution<
  TOptions extends ExportOptions = ExportOptions
>(options: TOptions): Promise<string> {
  const exportOptions: ExportOptions = partialCopy(options, [
    "name",
    "async",
    "include",
    "maxAsyncWaitTime",
    "targetVersion",
  ]);
  const packageType = options.packageType ?? "Both";
  const [path] = await Promise.all([
    options.path ?? createTempPath(exportOptions),
    authenticate({ ...options, name: options.profileName }),
  ]);

  const exportPromises: PacResponse[] = [];
  if (packageType === "Both" || packageType === "Unmanaged") {
    exportPromises.push(
      pacExportSolution({
        ...exportOptions,
        managed: false,
        path,
      })
    );
  }
  if (packageType === "Both" || packageType === "Managed") {
    exportPromises.push(
      pacExportSolution({
        ...exportOptions,
        managed: true,
        path: path.replace(/\.zip$/g, "_managed.zip"),
      })
    );
  }

  await Promise.all(exportPromises);

  return path;
}

async function createTempPath(options: ExportOptions): Promise<string> {
  return join(await createTempDir(), `${options.name}.zip`);
}

export const exportSolutionCommandConfig: CommandConfig<ExportOptions, string> =
  {
    name: "export",
    action: exportSolution,
    description:
      "Export a Dataverse Solution project from the current Dataverse Organization",
    options: [
      ...transformCommandConfigOptions(authenticateCommandConfig.options, {
        edits: {
          name: { name: "profileName", abbreviation: "pn" },
          password: { abbreviation: "pw" },
        },
      }),
      {
        name: "path",
        abbreviation: "p",
        description:
          "Path where the exported solution zip file will be written",
      },
      {
        name: "name",
        abbreviation: "n",
        description: "The name of the solution to be exported",
        required: true,
      },
      {
        name: "packageType",
        abbreviation: "pt",
        description: '"Managed", "Unmanaged", or "Both". Defaults to "Both".',
      },
      {
        name: "targetVersion",
        abbreviation: "v",
        description: "The version that the exported solution will support",
      },
      {
        name: "include",
        abbreviation: "i",
        description:
          "Which settings should be included in the solution being exported.\n" +
          `Values: ${[
            "autonumbering",
            "calendar",
            "customization",
            "emailtracking",
            "externalapplications",
            "general",
            "isvconfig",
            "marketing",
            "outlooksynchronization",
            "relationshiproles",
            "sales",
          ].join(", ")}`,
        type: "array",
      },
      {
        name: "async",
        abbreviation: "a",
        description: "Exports solution asynchronously",
        type: "flag",
      },
      {
        name: "maxAsyncWaitTime",
        abbreviation: "wt",
        description:
          "Max asynchronous wait time in minutes. Default value is 60 mintues",
      },
    ],
  };
