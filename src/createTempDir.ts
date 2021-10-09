import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export async function createTempDir() {
  const container = getTempContainer();
  const timeStamp = new Date().getTime();
  const hash = generateRandomString();
  const tempDir = join(container, `${timeStamp}-${hash}`);
  await mkdir(tempDir, { recursive: true });
  return tempDir;
}

export const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
function generateRandomString() {
  return [...Array(10)]
    .map(() => characters.charAt(Math.random() * characters.length))
    .join("");
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
