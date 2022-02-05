import {ChangeTypeEnum, SchemaDiffType} from "../types";
import {ChangeColor} from "../helpers/change-color";

export function SchemaEnumTemplate(ENUM: SchemaDiffType, modelName: string): string {
    const enums: string[] = [...new Set([...ENUM.enum ?? [], ...ENUM.added, ...ENUM.deleted])];
    const modeNameBG: string = ENUM.changeType === ChangeTypeEnum.updated ? 'transparent' : ChangeColor(ENUM.changeType);

    return `
    <div id="model-${modelName}" class="model-container" data-name="${modelName}">
        <span class="models-jump-to-path"></span>
        <div class="model-box">
            <span class="model">
                <span class="prop">
                    <span class="model-title prop-name" style="background-color: ${modeNameBG}">${modelName}</span>
                    <span class="prop-type">${ENUM.type ?? 'string'}</span>
                    <span class="prop-enum"><br>
                        Enum:
                        <span>
                            [${enums.map((key: string) => `<span style="background-color: ${
                                ENUM.added.includes(key) || ENUM.changeType === ChangeTypeEnum.created
                                  ? ChangeColor(ChangeTypeEnum.created) :
                                  (ENUM.deleted.includes(key) ? ChangeColor(ChangeTypeEnum.deleted) : ChangeColor(ChangeTypeEnum.default))
                            }">${key}</span>`).join(', ')}]
                        </span>
                    </span>
                </span>
            </span>
        </div>
    </div>
`
}