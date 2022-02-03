import {PathsDiffType} from "./paths-diff.type";
import {SchemasDifference} from "./schemas-difference.type";

export type ChangeLogJsonType = {
  paths: PathsDiffType,
  schemas: SchemasDifference,
}