import { Command, program } from "commander";
import { pac } from "pac-wrap";
import { exit } from "process";
import version from "./version.js";

program.version(version);

program
  .command("pac")
  .description("Run the Power Platform CLI")
  .action((_, command: Command) => {
    pac(command.args).catch(exit);
  });

program.parse();
