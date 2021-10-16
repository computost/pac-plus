import { AuthenticateOptions } from "./CreateAuthOptions.js";
import { ExportOptions } from "./ExportOptions";
import { UnpackOptions } from "./UnpackOptions";

export type CommitOptions = Optional<
  Omit<
    AuthenticateOptions & ExportOptions & UnpackOptions & { message: string },
    "managed" | "path" | "zipFile"
  >,
  "folder"
> & { message: string };
