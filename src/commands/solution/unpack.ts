import { unpackSolution as pacUnpackSolution } from "pac-wrap";
import { join } from "path";
import { cwd } from "process";
import { CommandConfig } from "../../types/CommandConfig.js";
import { UnpackOptions } from "../../types/UnpackOptions.js";
import { partialCopy } from "../../util/partialCopy.js";
import { transformCommandConfigOptions } from "../../util/transformCommandConfigOptions.js";
import { exportSolution, exportSolutionCommandConfig } from "./export.js";

export async function unpackSolution(options: UnpackOptions) {
  if (!(options.name || options.zipFile)) {
    throw new Error(
      'Unable to determine zip file to unpack (must define either "name" (solution to export) or "zipFile").'
    );
  }

  if (!(options.folder || options.name)) {
    throw new Error(
      'Unable to determine unpack folder (must define either "folder" or "name").'
    );
  }

  const zipFile = options.name
    ? await exportSolution({
        ...options,
        ...{ name: options.name, path: options.zipFile },
      })
    : options.zipFile!;

  const folder = options.folder ?? join(cwd(), options.name!);

  const unpackOptions: PacUnpackOptions = {
    ...partialCopy(options, [
      "errorLevel",
      "localize",
      "log",
      "map",
      "singleComponent",
      "sourceLoc",
      "useLcid",
      "useUnmanagedFileForMissingManaged",
      "zipFile",
    ]),
    allowDelete: options.allowDelete ?? "Yes",
    allowWrite: options.allowWrite ?? true,
    clobber: options.clobber ?? true,
    folder,
    packageType: options.packageType ?? "Both",
    zipFile,
  };

  await pacUnpackSolution(unpackOptions);

  return folder;
}

export const unpackSolutionCommandConfig: CommandConfig<UnpackOptions, string> =
  {
    name: "unpack",
    action: unpackSolution,
    description:
      "Extract solution components from solution.zip onto local filesystem (SolutionPackager)",
    options: [
      ...transformCommandConfigOptions(exportSolutionCommandConfig.options, {
        deletes: ["path"],
        edits: {
          name: {
            description:
              "The name of the solution to be exported and unpacked.",
          },
        },
      }),
      {
        abbreviation: "z",
        name: "zipFile",
        description: "The full path to the solution ZIP file",
      },
      {
        abbreviation: "f",
        name: "folder",
        description:
          "The path to the root folder on the local filesystem. This will be written to.",
      },
      {
        abbreviation: "l",
        name: "log",
        description: "The path to the log file.",
      },
      {
        abbreviation: "e",
        name: "errorLevel",
        description:
          "Minimum logging level for log output [Verbose|Info|Warning|Error|Off]; default: Info",
      },
      {
        abbreviation: "sc",
        name: "singleComponent",
        description:
          "Only perform action on a single component type [WebResource|Plugin|Workflow|None]; default: None.",
      },
      {
        abbreviation: "ad",
        name: "allowDelete",
        description:
          "Dictates if delete operations may occur [Yes|No|Prompt]; default: prompt.",
        type: "flag",
      },
      {
        abbreviation: "ad",
        name: "allowWrite",
        description: "Dictates if write operations may occur; default: false.",
        type: "flag",
      },
      {
        abbreviation: "c",
        name: "clobber",
        description:
          "Enables that files marked read-only can be deleted or overwritten; default: false.",
        type: "flag",
      },
      {
        abbreviation: "m",
        name: "map",
        description:
          "The full path to a mapping xml file from which to read component folders to pack.",
      },
      {
        abbreviation: "src",
        name: "sourceLoc",
        description:
          "Generates a template resource file. " +
          "Possible Values are auto or an LCID/ISO code of the language you wish to export. " +
          "When Present, this will extract the string resources from the given locale as a neutral .resx. " +
          "If auto or just the long or short form of the switch is specified the base locale for the solution will be used.",
        type: "flagOrInput",
      },
      {
        abbreviation: "loc",
        name: "localize",
        description: "Extract or merge all string resources into .resx files.",
        type: "flag",
      },
      {
        abbreviation: "lcid",
        name: "useLcid",
        description:
          "Use LCID's (1033) rather than ISO codes (en-US) for language files.",
        type: "flag",
      },
      {
        abbreviation: "same",
        name: "useUnmanagedFileForMissingManaged",
        description:
          "Use the same XML source file when packaging for Managed and only Unmanaged XML file is found; " +
          "applies to AppModuleSiteMap, AppModuleMap, FormXml files",
        type: "flag",
      },
    ],
  };

type PacUnpackOptions = Parameters<typeof pacUnpackSolution>[0];
