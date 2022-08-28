import { AllOf, AnyOf, BooleanSchema, EnumSchema, notOf, NumberSchema, ObjectSchema, OneOf, RefSchema, StringSchema } from '../interfaces/schemas';

export type SchemaType = RefSchema | NumberSchema | StringSchema | ObjectSchema | BooleanSchema | EnumSchema | OneOf | AllOf | AnyOf | notOf;
export type NormalizedSchema = Record<string, SchemaType>;
