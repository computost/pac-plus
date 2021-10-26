import { BumpAction } from "./BumpAction.js";
import { AuthenticateOptions } from "./CreateAuthOptions.js";

export type BumpVersionOptions = AuthenticateOptions & {
  action: "auto" | BumpAction;
  folder: string;
  name: string;
};
