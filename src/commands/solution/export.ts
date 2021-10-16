import { exportSolution as pacExportSolution } from "pac-wrap";
import { join } from "path";
import { ExportOptions } from "../../types/ExportOptions.js";
import { PacResponse } from "../../types/PacResponse.js";
import { createTempDir } from "../../util/createTempDir.js";
import { partialCopy } from "../../util/partialCopy.js";
import { authenticate } from "../auth/create.js";

export async function exportSolution(options: ExportOptions) {
  const exportOptions: ExportOptions = partialCopy(options, [
    "name",
    "async",
    "include",
    "maxAsyncWaitTime",
    "targetVersion",
  ]);
  const { packageType } = options;
  const [path] = await Promise.all([
    options.path ?? createTempPath(exportOptions),
    authenticate(options),
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
