import {SchemaPropertyTemplate} from "./schema-property.template";
import {ChangeTypeEnum, SchemaDiffType, SchemaPropertyType} from "../types";
import {ChangeColor} from "../helpers/change-color";

export function SchemaTemplate(model: SchemaDiffType, modelName: string): string {
    const propsRowsHtml: string[] = model.property?.map(
      (prop: SchemaPropertyType) => SchemaPropertyTemplate(prop, model.changeType, model.added, model.deleted)
    ) ?? [];

    const modeNameBG: string = model.changeType === ChangeTypeEnum.updated ? 'transparent' : ChangeColor(model.changeType);

    return `
<div id="model-${modelName}" class="model-container" data-name="${modelName}">
    <span class="models-jump-to-path"></span>
    <span class="model-box">
        <div class="model-box">
            <button aria-expanded="true" class="model-box-control">
                <span class="pointer">
                    <span class="model-title">
                        <span class="model-title__text" style="background-color: ${modeNameBG}">${modelName}</span>
                    </span>
                </span>
            </button>
            <span class="brace-open object">{</span>
            <span class="inner-object">
                <table class="model">
                    <tbody>
                        ${propsRowsHtml.join('\n')}
                    </tbody>
                </table>
            </span>
            <span class="brace-close">}</span>
        </div>
    </span>
</div>
`
}
