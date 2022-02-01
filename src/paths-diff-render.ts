import {PathsDiff} from "./paths-diff";
import {OperationDiff, OperationsChanges, PathParameterDiff, PathsDiffType, SchemaPropertyDiff} from "./types";
import {ChangeType} from "./types/change.type";
import * as fs from "fs";
import {ParameterTemplate} from "./templates/parameter.template";
import {ParametersTableTemplate} from "./templates/parameters-table.template";
import {OperationTemplate} from "./templates/operation.template";

export class PathsDiffRender {
  diffs: PathsDiffType;
  operationsKeys: string[];
  normalizeStyle!: string;
  uiStyle!: string;

  constructor(differ: PathsDiff) {
    this.diffs = differ.pathsDiff;
    this.operationsKeys = differ.operationsKeys;
    this.loadStyles();
    this.render();
    // this.save();
  }

  loadStyles(): void {
    this.normalizeStyle = fs.readFileSync('./src/css/normalize.css', { encoding: 'utf-8' });
    this.uiStyle = fs.readFileSync('./src/css/ui.css', { encoding: 'utf-8' });
  }

  save(): void {
    fs.writeFileSync('normalize.css', this.normalizeStyle);
    fs.writeFileSync('ui.css', this.uiStyle);
  }

  render(): void {
    const paths_addresses: string[] = Object.keys(this.diffs);

    const endpointsRendered: string[] = [];

    for(const path_address of paths_addresses) {

      endpointsRendered.push(
        ...this.renderOperations(this.diffs[path_address], path_address)
      );
      // break;
      // console.log(this.diffs[path_address]);
    }
    const endHtml: string = `
      <link rel="stylesheet" type="text/css" href="normalize.css">
      <link rel="stylesheet" type="text/css" href="ui.css">
      <div class="swagger-ui">
        ${endpointsRendered.join('\n')}
      </div>
    `
    fs.writeFileSync('file.html', endHtml);
    this.save();
  }

  renderOperations(operationsChanges: OperationsChanges, address: string): string[] {
    const operationsTypes: string[] = Object.keys(operationsChanges);

    const operationsHtml: string[] = [];

    for (const operationType of operationsTypes) {
      const operationHtml: string = OperationTemplate(
        this.renderOperation(operationsChanges[operationType]),
        address,
        operationType,
        operationsChanges[operationType].changeType,
      );
      operationsHtml.push(operationHtml);
    }
    return operationsHtml;
  }

  renderOperation({ changeType, request, responses, pathParameters }: OperationDiff): string {


    const parameters: string = pathParameters.length > 0 ? this.renderParameters(pathParameters, changeType) : '';

    //todo add render for request
    // this.renderRequestAndResponse(request, changeType);

    //todo add render for response
    //  this.renderRequestAndResponse(response, changeType);

    return `
    ${parameters}
    
    ${request.$ref && request.property ? 
      `<pre>
        <code type="language-json" style="white-space: pre;">
            ${ JSON.stringify(request, null, '  ') }
        </code>
      </pre>` 
      : ''
    }
    `
  }

  renderParameters(parameters: PathParameterDiff[], endpointChangeType: ChangeType): string {
    const elementsHtml: string[] = parameters.map((pathParameterDiff:PathParameterDiff) => ParameterTemplate(pathParameterDiff, endpointChangeType));

    return ParametersTableTemplate(elementsHtml);
  }

}