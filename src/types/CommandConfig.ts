export interface CommandConfig<TInputOptions = any, TOutputOptions = void> {
  name: string;
  action: (options: TInputOptions) => Promise<TOutputOptions>;
  description: string;
  options: CommandConfigOption<TInputOptions>[];
}

export interface CommandConfigOption<TInputOptions = any> {
  abbreviation: string;
  name: keyof TInputOptions & string;
  description: string;
  required?: boolean;
  type?: CommandConfigOptionType;
}

export type CommandConfigOptionType =
  | "array"
  | "flag"
  | "input"
  | "flagOrInput";
