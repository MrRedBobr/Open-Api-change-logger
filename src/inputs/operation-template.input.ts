import {ChangeTypeEnum} from "../types/change-type.enum";

export interface OperationTemplateInput {
  path_address: string,
  operationType: string,
  changeType: ChangeTypeEnum,
  parametersHtml: string,
  requestHtml: string,
  responseHtml: string,
}