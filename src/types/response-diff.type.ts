import {ChangeType} from "./change.type";
import {SchemaPropertyDiff} from "./schema-property-diff.type";

export type ResponseDiffType = {
  changeType: ChangeType;
} & SchemaPropertyDiff;