import {ChangeType} from "../types/change.type";

export interface OperationTemplateInput {
  path_address: string,
  operationType: string,
  changeType: ChangeType,
  parametersHtml: string,
  requestHtml: string,
  responseHtml: string,
}