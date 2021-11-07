import { Command } from "commander";
import {
  CommandConfig,
  CommandConfigOption,
  CommandConfigOptionType,
} from "../types/CommandConfig.js";
import { cleanup } from "./cleanup.js";

export function registerCommand<TInputOptions, TOutputOptions>(
  parent: Command,
  config: CommandConfig<TInputOptions, TOutputOptions>
) {
  const { name, action, description, options } = config;

  const command = parent.command(name).description(description);
  command.action((options) => {
    action(options).catch(console.error).finally(cleanup);
  });
  options.forEach(
    (option) => option.required && registerOption(command, option)
  );
  options.forEach(
    (option) => option.required || registerOption(command, option)
  );
}

function registerOption<TInputOptions>(
  command: Command,
  option: CommandConfigOption<TInputOptions>
) {
  const { abbreviation, description, name, required } = option;
  const type = option.type ?? "input";

  const flags = `-${abbreviation}, --${name}${generatePlaceholder(name, type)}`;

  if (required) {
    command.requiredOption(flags, `Required. ${description}`);
  } else {
    command.option(flags, description);
  }
}

function generatePlaceholder(name: string, type: CommandConfigOptionType) {
  switch (type) {
    case "array":
      return ` [${name}...]`;
    case "flag":
      return "";
    case "input":
      return ` <${name}>`;
    case "flagOrInput":
      return ` [${name}]`;
  }
}
