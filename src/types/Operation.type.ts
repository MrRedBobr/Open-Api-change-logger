import {Schema} from "./schema.type";
import {PathParameter} from "./parameter.type";

export type Operation = {
  pathParameters: PathParameter[],
  request: Schema[],
  response: Schema[],
}