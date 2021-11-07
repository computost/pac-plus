import { BumpAction } from "./BumpAction.js";
import { AuthenticateOptions } from "./AuthenticateOptions.js";
import { UnpackOptions } from "./UnpackOptions.js";

export type BumpVersionOptions = {
  action?: "auto" | BumpAction;
  skipUnpack?: boolean;
} & (
  | (UnpackOptions | { folder: string })
  | (AuthenticateOptions & { name: string })
);
