import { CommitOptions } from "../../types/CommitOptions.js";
import { git } from "../../util/git.js";

export async function commitSolution<
  TOptions extends CommitOptions = CommitOptions
>(options: TOptions): Promise<TOptions> {
  const { author, folder } = options;
  const message = options.message ?? "Automated commit";
  await git("add", folder);
  await git(
    "commit",
    "--message",
    message,
    ...(author ? ["--author", author] : [])
  );
  return options;
}
