import { commitSolution } from "./commands/solution/commit.js";
import { config } from "dotenv";
import { cwd, env } from "process";
import { join } from "path";
import { disableTelemetry } from "./util/disableTelemetry.js";
import { bumpSolutionVersion } from "./commands/solution/bumpVersion.js";

config();

(async () => {
  const solutionName = env.SOLUTION_NAME!;
  /*await commitSolution({
    message: "sample commit message",

    folder: join(cwd(), "temp", solutionName),
    name: solutionName,

    applicationId: env.APPLICATION_ID!,
    clientSecret: env.CLIENT_SECRET!,
    tenantId: env.TENANT_ID!,
    url: env.URL!,
  });*/
  await bumpSolutionVersion({
    action: "revision",
    folder: join(cwd(), "temp", solutionName),
    name: solutionName,

    applicationId: env.APPLICATION_ID!,
    clientSecret: env.CLIENT_SECRET!,
    tenantId: env.TENANT_ID!,
    url: env.URL!,
  });
})();
