import {ChangeType} from "../types/change.type";
import {ChangeTypeText} from "./change-type-text.template";

export function OperationTemplate(parameters: string, path_address: string, operationType: string, changeType: ChangeType) {
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
                    ${parameters}
                </div>
            </div>
            <div class="execute-wrapper"></div>
            <div class="responses-wrapper"></div>
        </div>
      </div>
    </div>
</span>
  `
}