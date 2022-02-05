import {ChangeTypeEnum} from "./change-type.enum";
import {Schema} from "./schema.type";

export type SchemaDiffType = {
  changeType: ChangeTypeEnum,
  added: string[],
  deleted: string[],
} & Schema;