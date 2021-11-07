import { unpackSolution } from "pac-wrap";
import { ExportOptions } from "./ExportOptions.js";

export type UnpackOptions = Optional<ExportOptions, "name"> &
  Optional<Parameters<typeof unpackSolution>[0], "folder" | "zipFile"> & {
    name?: string;
  };
