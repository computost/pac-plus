import { rm } from "fs/promises";
import { createAuth, exportSolution, unpackSolution } from "pac-wrap";
import { join } from "path";
import { cwd } from "process";
import { createTempDir } from "../createTempDir.js";

export async function exportUnpackSolution(
  options: ExportUnpackSolutionOptions
) {
  const allowDelete = options.allowDelete ?? "Yes";
  const allowWrite = options.allowWrite ?? true;
  const async = options.async ?? true;
  const clobber = options.clobber ?? true;
  const folder = options.folder ?? join(cwd(), options.name);
  const packageType = options.packageType ?? "Both";
  const {
    applicationId,
    clientSecret,
    cloud,
    errorLevel,
    include,
    localize,
    log,
    map,
    maxAsyncWaitTime,
    name,
    password,
    singleComponent,
    sourceLoc,
    targetVersion,
    tenantId,
    useLcid,
    username,
    useUnmanagedFileForMissingManaged,
    url,
  } = options;

  const tempDir = await createTempDir();

  const authOptions: CreateAuthOptions = {
    applicationId,
    clientSecret,
    cloud,
    password,
    tenantId,
    url,
    username,
  };
  if (isValidAuth(authOptions)) {
    await createAuth(authOptions);
  }

  const exportOptions: Omit<ExportOptions, "path"> = {
    name,
    async,
    include,
    maxAsyncWaitTime,
    targetVersion,
  };
  const exportPromises: Promise<any>[] = [];
  const zipFile = join(tempDir, `${name}.zip`);
  if (packageType === "Both" || packageType === "Unmanaged") {
    exportPromises.push(
      exportSolution({
        ...exportOptions,
        managed: false,
        path: zipFile,
      })
    );
  }
  if (packageType === "Both" || packageType === "Managed") {
    exportPromises.push(
      exportSolution({
        ...exportOptions,
        managed: true,
        path: join(
          tempDir,
          `${name}${packageType === "Both" ? "_managed" : ""}.zip`
        ),
      })
    );
  }
  await Promise.all(exportPromises);

  const unpackOptions: UnpackOptions = {
    folder,
    zipFile,
    allowDelete,
    allowWrite,
    clobber,
    errorLevel,
    localize,
    log,
    map,
    packageType,
    singleComponent,
    sourceLoc,
    useLcid,
    useUnmanagedFileForMissingManaged,
  };
  await unpackSolution(unpackOptions);
  rm(tempDir, { recursive: true });
}

function isValidAuth(authOptions: CreateAuthOptions) {
  const hasAmbiguousCredentials =
    (authOptions.applicationId !== undefined ||
      authOptions.clientSecret !== undefined ||
      authOptions.tenantId !== undefined) &&
    (authOptions.password !== undefined || authOptions.username !== undefined);
  if (hasAmbiguousCredentials) {
    throw new Error(
      "Ambiguous credentials detected. Must supply either " +
        "(applicationId, clientSecret, and tenantId) or " +
        "(username and password)"
    );
  }

  const hasUrl = authOptions.url !== undefined;

  const hasClientCredentials =
    authOptions.applicationId !== undefined &&
    authOptions.clientSecret !== undefined &&
    authOptions.tenantId !== undefined;
  const hasBasicCredentials =
    authOptions.password !== undefined && authOptions.username !== undefined;
  const hasCredentials = hasClientCredentials || hasBasicCredentials;

  const isValid = hasUrl && hasCredentials;
  if (isValid) {
    return true;
  } else {
    if (hasUrl || hasCredentials) {
      throw new Error(
        "Incomplete credentials detected. " +
          "Must supply both url and credential set."
      );
    }
  }
}

type CreateAuthOptions = Parameters<typeof createAuth>[0];
type ExportOptions = Parameters<typeof exportSolution>[0];
type UnpackOptions = Parameters<typeof unpackSolution>[0];
type ExportUnpackSolutionOptions = Optional<
  Omit<
    CreateAuthOptions & ExportOptions & UnpackOptions,
    "managed" | "path" | "zipFile"
  >,
  "folder"
>;
