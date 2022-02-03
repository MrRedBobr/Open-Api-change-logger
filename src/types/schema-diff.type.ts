import {ChangeType} from "./change.type";
import {Schema} from "./schema.type";

export type SchemaDiffType = {
  changeType: ChangeType,
  added: string[],
  deleted: string[],
} & Schema;