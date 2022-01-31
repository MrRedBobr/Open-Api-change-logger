import {Schema} from "./schema.type";

export type SchemaPropertyType = {
  name: string,
  required: boolean,
} & Schema;