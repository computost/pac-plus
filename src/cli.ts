#!/usr/bin/env node
import { Command, program } from "commander";
import { pac } from "pac-wrap";
import { exit } from "process";
import { commitSolution } from "./commands/solution/commit.js";
import version from "./version.js";

program.version(version);

program
  .command("pac")
  .description("Run the Power Platform CLI")
  .allowUnknownOption()
  .action((_, command: Command) => {
    pac(command.args).catch(exit);
  });

program
  .command("commit-solution")
  .description("Exports, unpacks, and commits a solution to source control.")
  .requiredOption(
    "-n, --name <name>",
    "Name of the solution to export and unpack."
  )
  .option(
    "-m, --message <message>",
    'Commit message to use when committing the solution. Defaults to "Automated commit".'
  )
  .option(
    "-f, --folder <folder>",
    "Folder to unpack the solution to. " +
      "Defaults to the exported solution name in the current working directory."
  )
  .option(
    "-u, --url <url>",
    "The URL of the Dataverse environment to export the solution from."
  )
  .option("-un, --username <username>", "The username to authenticate with.")
  .option("-p, --password <password>", "The password to authenticate with.")
  .option(
    "-id, --applicationId <applicationId>",
    "The application id to authenticate with."
  )
  .option(
    "-cs, --clientSecret <clientSecret>",
    "The client secret to authenticate with."
  )
  .option(
    "-t, --tenantId <tenantId>",
    "Tenant id if using application id & secret."
  )
  .option(
    "-ci, --cloud <cloud>",
    "The cloud instance to authenticate with." +
      "Values: Public, Tip1, Tip2, UsGov, UsGovHigh, UsGovDod"
  )
  .action((options) => commitSolution(options).catch(console.error));

program.parse();
