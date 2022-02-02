import {PathsDiff} from "./paths-diff";
import {
  OperationDiff,
  OperationsChanges,
  PathParameterDiff,
  PathsDiffType,
  SchemaPropertyDiff,
  SchemaPropertyType
} from "./types";
import {ChangeType} from "./types/change.type";
import * as fs from "fs";
import {ParameterTemplate} from "./templates/parameter.template";
import {ParametersTableTemplate} from "./templates/parameters-table.template";
import {OperationTemplate} from "./templates/operation.template";
import {RequestTemplate} from "./templates/request.template";
import {RequestTableTemplate} from "./templates/request-table.template";
import {SchemaPropertyTemplate} from "./templates/schema-property.template";
import {ParametersTemplate} from "./templates/parameters.template";
import {ResponsesDiffObjectType} from "./types/responses-diff-object.type";
import {ResponseDiffType} from "./types/response-diff.type";
import {ResponseTableTemplate} from "./templates/response-table.template";
import {ResponsesTemplate} from "./templates/responses.template";

export class PathsDiffRender {
  diffs: PathsDiffType;
  operationsKeys: string[];

  constructor(differ: PathsDiff) {
    this.diffs = differ.pathsDiff;
    this.operationsKeys = differ.operationsKeys;
  }

  render(): string {
    const paths_addresses: string[] = Object.keys(this.diffs);

    const endpointsRendered: string[] = [];

    for(const path_address of paths_addresses) {

      endpointsRendered.push(
        ...this.renderOperations(this.diffs[path_address], path_address)
      );
    }
    return`
      <div class="wrapper">
        <section class="block col-12 block-desktop col-12-desktop">
            <div>${endpointsRendered.join('\n')}</div>
        </section>
      </div>
    `
  }

  renderOperations(operationsChanges: OperationsChanges, address: string): string[] {
    const operationsTypes: string[] = Object.keys(operationsChanges);

    const operationsHtml: string[] = [];

    for (const operationType of operationsTypes) {
      const { parametersHtml, requestHtml, responseHtml } = this.renderOperation(operationsChanges[operationType]);

      const operationHtml: string = OperationTemplate({
        path_address: address,
        operationType,
        changeType: operationsChanges[operationType].changeType,
        parametersHtml,
        requestHtml,
        responseHtml,
      });
      operationsHtml.push(operationHtml);
    }
    return operationsHtml;
  }

  renderOperation({ changeType, request, responses, pathParameters }: OperationDiff): { parametersHtml: string, requestHtml: string, responseHtml: string } {
    const parametersHtml: string = this.renderParameters(pathParameters, changeType);

    const requestHtml: string = this.renderRequest(request, changeType);

    const responseHtml: string = this.renderResponses(responses);

    return {
      parametersHtml,
      requestHtml,
      responseHtml
    }
  }

  renderParameters(parameters: PathParameterDiff[], endpointChangeType: ChangeType): string {
    if (parameters.length > 0) {
      const elementsHtml: string[] = parameters.map((pathParameterDiff:PathParameterDiff) => ParameterTemplate(pathParameterDiff, endpointChangeType));
      return ParametersTemplate(ParametersTableTemplate(elementsHtml));
    }
    return '';
  }

  renderRequest(request: SchemaPropertyDiff, endpointChangeType: ChangeType): string {
    if(request.$ref || (request.property?.length && request.property?.length)) {
      let html: string = '';

      if(request.$ref) {
        html = `<span class="model">${request.$ref}</span>`;
      }

      if (request.property?.length) {
        html = RequestTableTemplate(
          request.property.map((prop: SchemaPropertyType): string => SchemaPropertyTemplate(
            prop,
            endpointChangeType,
            request.added,
            request.deleted,
          ))
        );
      }

      return RequestTemplate(html);
    }
    return '';
  }

  renderResponses(response: ResponsesDiffObjectType): string {
    const responseCodes: string[] = Object.keys(response);

    const tablesHtml: string[] = [];

    for(const responseCode of responseCodes) {
      const {changeType, ...res}: ResponseDiffType = response[responseCode];

      const paramsTable: string = this.renderRequest(res, changeType);

      const tableHtml: string = ResponseTableTemplate(responseCode, changeType, paramsTable);

      tablesHtml.push(tableHtml)
    }

    return ResponsesTemplate(tablesHtml.join('\n'));
  }

}