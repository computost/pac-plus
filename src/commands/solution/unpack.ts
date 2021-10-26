import { unpackSolution as pacUnpackSolution } from "pac-wrap";
import { join } from "path";
import { cwd } from "process";
import { UnpackOptions } from "../../types/UnpackOptions.js";
import { partialCopy } from "../../util/partialCopy.js";

export function unpackSolution(options: UnpackOptions & { name?: string }) {
  if (!(options.folder || options.name)) {
    throw new Error("Unable to determine unpack folder");
  }

  const folder = options.folder ?? join(cwd(), options.name!);

  const unpackOptions: UnpackOptions = {
    ...partialCopy(options, [
      "errorLevel",
      "localize",
      "log",
      "map",
      "singleComponent",
      "sourceLoc",
      "useLcid",
      "useUnmanagedFileForMissingManaged",
      "zipFile",
    ]),
    allowDelete: options.allowDelete ?? "Yes",
    allowWrite: options.allowWrite ?? true,
    clobber: options.clobber ?? true,
    folder,
    packageType: options.packageType ?? "Both",
  };

  return pacUnpackSolution(unpackOptions);
}
