import { exportUnpackSolution } from "./commands/export-unpack-solution.js";
import { config } from "dotenv";
import { cwd, env } from "process";
import { join } from "path";

config();

(async () => {
  const solutionName = env.SOLUTION_NAME!;
  await exportUnpackSolution({
    name: solutionName,
    folder: join(cwd(), "temp", solutionName),

    applicationId: env.APPLICATION_ID,
    clientSecret: env.CLIENT_SECRET,
    tenantId: env.TENANT_ID,
    url: env.URL,
  });
})();
