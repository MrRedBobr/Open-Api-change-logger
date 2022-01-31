import {ChangeType} from "./change.type";
import {PathParameter} from "./parameter.type";

export type PathParameterDiff = {
  changeType: ChangeType,
  added: string[],
  deleted: string[],
} & PathParameter;