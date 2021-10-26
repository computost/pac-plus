import { CommitOptions } from "../../types/CommitOptions.js";
import { git } from "../../util/git.js";

export async function commitSolution(options: CommitOptions) {
  const { author, folder, message } = options;
  await git("add", folder);
  await git(
    "commit",
    "--message",
    message,
    ...(author ? ["--author", author] : [])
  );
}
