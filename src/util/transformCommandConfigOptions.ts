import { CommandConfigOption } from "../types/CommandConfig";

export function transformCommandConfigOptions(
  options: CommandConfigOption[],
  transformations: Transformations
) {
  return editOptions(
    deleteOptions(options, transformations.deletes),
    transformations.edits
  );
}

function deleteOptions(options: CommandConfigOption[], deletes?: string[]) {
  if (deletes) {
    const returnValue = options.filter(
      (option) => deletes.indexOf(option.name) === -1
    );
    return returnValue;
  } else {
    return options;
  }
}

function editOptions(options: CommandConfigOption[], edits?: Edits) {
  if (edits) {
    return options.map((option) =>
      option.name in edits ? { ...option, ...edits[option.name] } : option
    );
  } else {
    return options;
  }
}

interface Transformations {
  deletes?: string[];
  edits?: Edits;
}

interface Edits {
  [name: string]: Partial<CommandConfigOption>;
}
