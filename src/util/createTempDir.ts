import { mkdir, rm } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { addCleanupAction } from "./cleanup.js";
import { generateRandomString } from "./generateRandomString";

export async function createTempDir() {
  const container = getTempContainer();
  const timeStamp = new Date().getTime();
  const hash = generateRandomString();
  const tempDir = join(container, `${timeStamp}-${hash}`);
  await mkdir(tempDir, { recursive: true });
  addCleanupAction(() => rm(tempDir, { recursive: true }));
  return tempDir;
}

function getTempContainer() {
  const packagePath = getPackagePath();
  const tempContainerPath = join(packagePath, "temp");
  return tempContainerPath;
}

function getPackagePath() {
  return join(getDirName(), "..");
}

function getDirName() {
  const fileName = fileURLToPath(import.meta.url);
  const dirName = dirname(fileName);
  return dirName;
}
