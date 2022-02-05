import {ChangeTypeEnum} from "./change-type.enum";
import {SchemaPropertyDiff} from "./schema-property-diff.type";

export type ResponseDiffType = {
  changeType: ChangeTypeEnum;
} & SchemaPropertyDiff;