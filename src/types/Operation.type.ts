import {PathParameters} from "../pathParameters";
import {Schema} from "./schema.type";

export type Operation = {
  operationType: string,
  pathParameters: PathParameters[],
  request: Schema[],
  response: Schema[],
}