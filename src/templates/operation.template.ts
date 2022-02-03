import {ChangeTypeText} from "./change-type-text.template";
import {OperationTemplateInput} from "../inputs/operation-template.input";

export function OperationTemplate({ operationType, changeType, path_address, parametersHtml, requestHtml, responseHtml }: OperationTemplateInput) {
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
          ${changeType !== 'DEFAULT' ? ChangeTypeText(changeType) : ''}
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