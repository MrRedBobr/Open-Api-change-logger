import { SchemaPropertyType } from "./schema-property.type";

export type SchemaPropertyDiff = {
  added: string[];
  deleted: string[];
  property?: SchemaPropertyType[];
  $ref?: string;
  type?: string;
  breakChanges?: true;
};
