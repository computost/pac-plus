import { exportSolution } from "pac-wrap";
import { PackageType } from "pac-wrap/dist/types";
import { AuthenticateOptions } from "./AuthenticateOptions.js";

export type ExportOptions = AuthenticateOptions &
  Optional<Omit<Parameters<typeof exportSolution>[0], "managed">, "path"> & {
    packageType?: PackageType;
    profileName?: string;
  };
