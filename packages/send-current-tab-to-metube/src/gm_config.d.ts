/*
Copyright 2009+, GM_config Contributors (https://github.com/sizzlemctwizzle/GM_config)

GM_config is distributed under the terms of the GNU Lesser General Public License.
See <https://www.gnu.org/licenses/> for details.
*/

type FieldValue = string | number | boolean;
type FieldTypes =
  | "text"
  | "textarea"
  | "button"
  | "radio"
  | "select"
  | "checkbox"
  | "unsigned int"
  | "unsigned integer"
  | "int"
  | "integer"
  | "float"
  | "number"
  | "hidden";

interface InitOptionsNoCustom {
  id: string;
  title?: string | HTMLElement;
  fields: Record<string, Field>;
  css?: string;
  frameStyle?: string;
  frame?: HTMLElement;
  events?: {
    init?: GM_configStruct["onInit"];
    open?: GM_configStruct["onOpen"];
    save?: GM_configStruct["onSave"];
    close?: GM_configStruct["onClose"];
    reset?: GM_configStruct["onReset"];
  };
}

interface InitOptionsCustom<CustomTypes extends string>
  extends Omit<InitOptionsNoCustom, "fields"> {
  fields: Record<string, Field<CustomTypes>>;
  types: { [type in CustomTypes]: CustomType };
}

type InitOptions<CustomTypes extends string> =
  | InitOptionsNoCustom
  | InitOptionsCustom<CustomTypes>;

interface Field<CustomTypes extends string = never> {
  [key: string]: any;
  label?: string | HTMLElement;
  type: FieldTypes | CustomTypes;
  title?: string;
  default?: FieldValue;
  save?: boolean;
}

interface CustomType {
  default?: FieldValue | null;
  toNode?: GM_configField["toNode"];
  toValue?: GM_configField["toValue"];
  reset?: GM_configField["reset"];
}

declare function GM_configInit<CustomTypes extends string>(
  config: GM_configStruct<CustomTypes>,
  options: InitOptions<CustomTypes>,
): void;

declare function GM_configDefaultValue(type: FieldTypes): FieldValue;

declare class GM_configStruct<CustomTypes extends string = never> {
  constructor(options: InitOptions<CustomTypes>);
  init<CustomTypes extends string>(options: InitOptions<CustomTypes>): void;
  open(): void;
  close(): void;
  set(fieldId: string, value: FieldValue): void;
  get(fieldId: string, getLive?: boolean): FieldValue;
  save(): void;
  read(store?: string): any;
  write(store?: string, obj?: any): any;
  create(...args: [string] | [string, any] | []): HTMLElement;
  center(): void;
  remove(el: HTMLElement): void;
  isGM: boolean;
  setValue(name: string, value: FieldValue): Promise<void> | void;
  getValue(name: string, def: FieldValue): FieldValue;
  stringify(obj: any): string;
  parser(jsonString: string): any;
  log(data: string): void;
  id: string;
  title: string;
  css: { basic: string[]; basicPrefix: string; stylish: string };
  frame?: HTMLElement;
  fields: Record<string, GM_configField>;
  onInit?: (this: GM_configStruct) => void;
  onOpen?: (
    this: GM_configStruct,
    document: Document,
    window: Window,
    frame: HTMLElement,
  ) => void;
  onSave?: (this: GM_configStruct, values: any) => void;
  onClose?: (this: GM_configStruct) => void;
  onReset?: (this: GM_configStruct) => void;
  isOpen: boolean;
}

declare let GM_config: GM_configStruct;

declare class GM_configField {
  constructor(
    settings: Field,
    stored: FieldValue | undefined,
    id: string,
    customType: CustomType | undefined,
    configId: string,
  );
  [key: string]: any;
  settings: Field;
  id: string;
  configId: string;
  node: HTMLElement | null;
  wrapper: HTMLElement | null;
  save: boolean;
  value: FieldValue;
  default: FieldValue;
  create: GM_configStruct["create"];
  toNode(this: GM_configField, configId?: string): HTMLElement;
  toValue(this: GM_configField): FieldValue | null;
  reset(this: GM_configField): void;
  remove(el?: HTMLElement): void;
  reload(): void;
  _checkNumberRange(num: number, warn: string): true | null;
}
