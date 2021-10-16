import { BumpAction } from "./BumpAction.js";
import { AuthenticateOptions } from "./CreateAuthOptions.js";

export type BumpVersionOptions = AuthenticateOptions & {
  action: BumpAction;
  currentVersion?: string;
  name: string;
};
