import execa from "execa";

export async function git(...args: string[]) {
  const process = await execa("git", args, { stdio: "pipe" });
  return process.stdout;
}
