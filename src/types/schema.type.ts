import {SchemaPropertyType} from "./schema-property.type";

export type Schema = {
  deprecated: boolean,
  type: string,
  required?: boolean,
  $ref?: string,
  format?: string,
  enum?: string[],
  property?: SchemaPropertyType[]
}