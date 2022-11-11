import { NormalizedSchema } from '../normalizer-types/normalized-schema';

export interface RefSchema extends GeneralOptions {
  type: 'ref';
  name: string;
}

export interface NumberSchema extends GeneralOptions {
  type: 'number';
}

export interface StringSchema extends GeneralOptions {
  type: 'string';
}

export interface ObjectSchema extends GeneralOptions {
  type: 'object';
  object: NormalizedSchema;
}

export interface BooleanSchema extends GeneralOptions {
  type: 'boolean';
}

export interface EnumSchema extends GeneralOptions {
  type: 'enum';
  values: string[];
}

export interface OneOf {
  oneOf: RefSchema[];
}

export interface AllOf {
  allOf: RefSchema[];
}
export interface AnyOf {
  anyOf: RefSchema[];
}

export interface notOf {
  not?: RefSchema;
}

export interface GeneralOptions {
  isArray: boolean;
  required?: boolean;
  example?: string;
  title?: string;
}
