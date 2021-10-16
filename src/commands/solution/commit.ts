import { unpackSolution as pacUnpackSolution } from "pac-wrap";
import { join } from "path";
import { cwd } from "process";
import { exportSolution } from "./export.js";
import { UnpackOptions } from "../../types/UnpackOptions.js";
import { partialCopy } from "../../util/partialCopy.js";
import { CommitOptions } from "../../types/CommitOptions.js";

export async function commitSolution(options: CommitOptions) {
  const zipFile = await exportSolution(options);
  await unpackSolution(zipFile, options);
}

function unpackSolution(zipFile: string, options: CommitOptions) {
  const unpackOptions: UnpackOptions = {
    zipFile,
    ...partialCopy(options, [
      "folder",
      "allowDelete",
      "allowWrite",
      "clobber",
      "errorLevel",
      "localize",
      "log",
      "map",
      "packageType",
      "singleComponent",
      "sourceLoc",
      "useLcid",
      "useUnmanagedFileForMissingManaged",
    ]),
    ...{
      allowDelete: options.allowDelete ?? "Yes",
      allowWrite: options.allowWrite ?? true,
      clobber: options.clobber ?? true,
      folder: options.folder ?? join(cwd(), options.name),
      packageType: options.packageType ?? "Both",
    },
  };

  return pacUnpackSolution(unpackOptions);
}
