import {SchemaPropertyDiff} from "./schema-property-diff.type";
import {PathParameterDiff} from "./path-parameter-diff.type";
import {ChangeType} from "./change.type";

export type OperationDiff = {
  changeType: ChangeType,
  pathParameters: PathParameterDiff[],
  request: SchemaPropertyDiff,
  response: SchemaPropertyDiff,
}