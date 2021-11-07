#!/usr/bin/env node
import { Command, program } from "commander";
import { pac } from "pac-wrap";
import { exit } from "process";
import { authenticateCommandConfig } from "./commands/auth/authenticate.js";
import { bumpSolutionVersionCommandConfig } from "./commands/solution/bumpVersion.js";
import { exportSolutionCommandConfig } from "./commands/solution/export.js";
import { unpackSolutionCommandConfig } from "./commands/solution/unpack.js";
import { registerCommand } from "./util/registerCommand.js";
import version from "./version.js";

program.version(version);

program
  .command("pac")
  .description("Run the Power Platform CLI")
  .allowUnknownOption()
  .action((_, command: Command) => {
    pac(command.args).catch(exit);
  });

registerCommand(program, authenticateCommandConfig);

const solutionCommand = program
  .command("solution")
  .description("Commands related to solutions");

registerCommand(solutionCommand, exportSolutionCommandConfig);
registerCommand(solutionCommand, unpackSolutionCommandConfig);
registerCommand(solutionCommand, bumpSolutionVersionCommandConfig);

program.parse();
