import {ChangeTypeEnum} from "./change-type.enum";
import {PathParameter} from "./parameter.type";

export type PathParameterDiff = {
  changeType: ChangeTypeEnum,
  added: string[],
  deleted: string[],
} & PathParameter;