import {Schema} from "./schema.type";

export type SchemaPropertyType = {
  required: boolean,
  name: string,
} & Schema;