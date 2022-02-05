import {SchemaPropertyDiff} from "./schema-property-diff.type";
import {PathParameterDiff} from "./path-parameter-diff.type";
import {ChangeTypeEnum} from "./change-type.enum";
import {ResponsesDiffObjectType} from "./responses-diff-object.type";

export type OperationDiff = {
  changeType: ChangeTypeEnum,
  pathParameters: PathParameterDiff[],
  request: SchemaPropertyDiff,
  responses: ResponsesDiffObjectType,
  deprecated: boolean,
}