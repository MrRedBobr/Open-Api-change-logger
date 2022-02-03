import {Schema} from "./schema.type";
import {PathParameter} from "./parameter.type";
import {ResponsesTypeObject} from "./responsesTypeObject";

export type Operation = {
  pathParameters: PathParameter[],
  request: Schema[],
  response: ResponsesTypeObject,
  deprecated: boolean,
}