import {PathsDiffer} from "./paths-differ";
import {
  OperationDiff,
  OperationsChanges,
  PathParameterDiff,
  PathsDiffType, SchemaDiffType,
  SchemaPropertyDiff,
  SchemaPropertyType
} from "./types";
import {ChangeTypeEnum} from "./types";
import {ResponsesDiffObjectType} from "./types/responses-diff-object.type";
import {ResponseDiffType} from "./types/response-diff.type";
import {SchemasDiffRender} from "./schemas-diff.render";
import {SchemasDiffer} from "./schemas-differ";
import {ChangesWhenNeedUseColor} from "./const/changes-when-need-use-color.const";
import {ChangeColor} from "./helpers/change-color";
import {OperationTemplateInput} from "./inputs/operation-template.input";
import {ChangeTypeText} from "./templates/change-type-text.template";

export class PathsDiffRender extends SchemasDiffRender {
  diffs: PathsDiffType;
  operationsKeys: string[];

  constructor(differ: PathsDiffer, modelsDiffer: SchemasDiffer) {
    super(modelsDiffer);

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

      if(operationsChanges[operationType].changeType !== 'DEFAULT') {
        const operationHtml: string = this.operationTemplate({
          path_address: address,
          operationType,
          changeType: operationsChanges[operationType].changeType,
          parametersHtml,
          requestHtml,
          responseHtml,
        });
        operationsHtml.push(operationHtml);
      }
    }
    return operationsHtml;
  }

  renderOperation({ changeType, request, responses, pathParameters }: OperationDiff): { parametersHtml: string, requestHtml: string, responseHtml: string } {
    const parametersHtml: string = this.renderParameters(pathParameters, changeType);

    const requestHtml: string =this.requestRender(request, changeType);

    const responseHtml: string = this.responsesRender(responses);

    return {
      parametersHtml,
      requestHtml,
      responseHtml
    }
  }

  renderParameters(parameters: PathParameterDiff[], endpointChangeType: ChangeTypeEnum): string {
    if (parameters.length > 0) {
      const elementsHtml: string[] = parameters.map((pathParameterDiff:PathParameterDiff) => this.parameterTemplate(pathParameterDiff, endpointChangeType));
      return this.parametersTemplate(this.parametersTableTemplate(elementsHtml));
    }
    return '';
  }

  renderSchema(request: SchemaPropertyDiff, endpointChangeType: ChangeTypeEnum): string {
    if(request.$ref || request?.type || (request.property?.length && request.property?.length)) {
      let html: string = '';

      if(request.$ref || request?.type) {
        html = this.renderRef(request.$ref ?? request?.type ?? '', request);
      } else if (request.property?.length && request.property?.length > 0) {
        const requestProperties: string[] = request.property.map((prop: SchemaPropertyType): string => {
          const propChangeType: ChangeTypeEnum = endpointChangeType !== ChangeTypeEnum.default ? endpointChangeType :
            request.added.includes(prop.name) ? ChangeTypeEnum.created :
              request.deleted.includes(prop.name) ? ChangeTypeEnum.deleted :
                ChangeTypeEnum.default;

          return this.schemaPropertyTemplate(
            prop,
            propChangeType,
          )
        });

        html = this.requestTableTemplate(requestProperties);
      }

      return html;
    }
    return '';
  }

  renderRef(type: string, request: SchemaPropertyDiff): string {
    const reqProperty: SchemaPropertyType[]|undefined = request.property;

    if(type.includes('<') && reqProperty) { //then its generic type
      const mainModelName: string = type.split('<')[0];
      const model: SchemaDiffType = this.modelsDiffObj[mainModelName];
      const genericProperty: SchemaPropertyType = reqProperty[0];

      const rewriteProp: SchemaPropertyType | undefined = model.property?.find((prop: SchemaPropertyType) => prop.name === genericProperty.name);

      if(rewriteProp) {
        rewriteProp.type = genericProperty.type;
        rewriteProp.property = genericProperty.property;
        rewriteProp.required = genericProperty.required;
        rewriteProp.deprecated = genericProperty.deprecated;
        rewriteProp.enum = genericProperty.enum;
        rewriteProp.format = genericProperty.format;
        rewriteProp.$ref = genericProperty.$ref;
      } else {
        model.property?.push(genericProperty);
      }

      const typeName: string = type.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      return this.schemaTemplate(model, typeName);
    }

    let html: string = `<span class="model">${type}</span>`;

    if(request.$ref) {
      html = this.renderRefButton(request.type ?? '', request.$ref);
    }

    return html;
  }

  requestRender(request: SchemaPropertyDiff, endpointChangeType: ChangeTypeEnum): string {
    const renderedSchema: string = this.renderSchema(request, endpointChangeType);

    return renderedSchema ? this.requestTemplate(renderedSchema) : '';
  }

  responsesRender(response: ResponsesDiffObjectType): string {
    const responseCodes: string[] = Object.keys(response);

    const tablesHtml: string[] = [];

    for(const responseCode of responseCodes) {
      const {changeType, ...res}: ResponseDiffType = response[responseCode];

      const paramsTable: string = this.renderSchema(res, changeType);

      const tableHtml: string = this.responseTableTemplate(responseCode, changeType, paramsTable);

      tablesHtml.push(tableHtml)
    }

    return tablesHtml.length > 0 ? this.responsesTemplate(tablesHtml.join('\n')) : '';
  }

  parameterTemplate(v:PathParameterDiff, endpointChangeType: ChangeTypeEnum) {
    const useColor: boolean = ChangesWhenNeedUseColor.includes(endpointChangeType);

    return `
    <tr data-param-name="${v.name}" data-param-in="${v.placed}" ${useColor ? `style="background-color: ${ChangeColor(v.changeType)}` : ''}">
      <td class="parameters-col_name" style="position: relative">
        <div class="parameter__name ${v.required && 'required'}">${v.name}${v.required ? '<span>&nbsp;*</span>' : '' }</div>
        <div class="parameter__type">${v.type === 'ref' ? v.$ref : v.type}</div>
        <div class="parameter__deprecated">${v.deprecated ? 'deprecated' : ''}</div>
        <div class="parameter__in">(${v.placed})</div>
        ${v.format ? `<div class="parameter__type">${v.format}</div>` : ''}
      </td>
      <td class="parameters-col_description">
  <!--            todo add description-->
      </td>
    </tr>
`;
  }

  parametersTemplate(html: string): string {
    return `
<div class="opblock-body">
    <div class="opblock-section">
        <div class="opblock-section-header">
          <div class="tab-header">
            <div class="tab-item active">
                <h4 class="opblock-title"><span>Parameters</span></h4>
            </div>
          </div>
        </div>
        <div class="parameters-container">
            ${html}
        </div>
    </div>
    <div class="execute-wrapper"></div>
    <div class="responses-wrapper"></div>
</div>
`
  }

  parametersTableTemplate(elementsHtml: string[]) {
    return `
      <div class="table-container">
        <table class="parameters">
          <thead>
            <tr>
              <th class="col_header parameters-col_name">Name</th>
              <th class="col_header parameters-col_description">Description</th>
            </tr>
          </thead>
          <tbody>
          ${elementsHtml.join('\n')}
          </tbody>
        </table>
      </div>
      `
  }

  requestTemplate(html: string): string {
    return `
<div class="opblock-section opblock-section-request-body">
    <div class="opblock-section-header">
        <h4 class="opblock-title parameter__name">Request body</h4>
    </div>
    <div class="opblock-description-wrapper" style="padding: 16px">
        <div class="model-box">
            ${html}
        </div>
    </div>
</div>  
`
  }

  operationTemplate({ operationType, changeType, path_address, parametersHtml, requestHtml, responseHtml }: OperationTemplateInput) {
    return `
<span class="change-${changeType.toLowerCase()}">
  <div class="opblock opblock-${operationType} is-open">
        <div class="opblock-summary opblock-summary-${operationType}">
          <button class="opblock-summary-control" style="position: relative">
          <span class="opblock-summary-method">${operationType.toUpperCase()}</span>
          <span class="opblock-summary-path" data-path="${path_address}">
            <a class="nostyle" href="#${path_address}">
      <!--        <span></span>-->
            ${path_address}
            </a>
          </span>
      <!--    todo add description-->
      <!--    <div class="opblock-summary-description">Retrieve one item CartEntity</div>-->
      <!--    <svg class="arrow" width="20" height="20" aria-hidden="true" focusable="false">-->
      <!--      <use href="#large-arrow-up" xlink:href="#large-arrow-up"></use>-->
      <!--    </svg>-->
          ${changeType !== ChangeTypeEnum.default ? ChangeTypeText(changeType) : ''}
          </button>
        </div>
        <div class="no-margin">
        ${parametersHtml}
        ${requestHtml}
        ${responseHtml}
      </div>
    </div>
</span>
  `
  }

  responseTableTemplate(code: string, changeType: ChangeTypeEnum, html: string): string {
    const green: string = ChangeColor(changeType);

    return `
    <table class="responses-table">
        <thead>
            <tr class="responses-header">
                <th class="col_header response-col_status">Code</th>
                <th class="col_header response-col_description">Description</th>
            </tr>
        </thead>
        <tbody>
            <tr class="response" data-code="${code}" style="background-color: ${green}">
                <td>${code}</td>
                <td>${html}</td>
            </tr>
        </tbody>
    </table>
`
  }

  responsesTemplate(html: string): string {
    return `
<div class="responses-wrapper">
    <div class="opblock-section-header"><h4>Responses</h4></div>
    <div class="responses-inner">
        ${html}
    </div>
</div>    
`
  }

  requestTableTemplate(propertyHtml: string[]): string {
    return `
<table class="model">
    <tbody>
        ${propertyHtml.join('\n')}
    </tbody>
</table>
`
  }

}