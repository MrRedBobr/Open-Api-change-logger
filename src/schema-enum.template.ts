import {SchemaDiffType} from "./types";
import {ChangeColor} from "./helpers/change-color";

export function SchemaEnumTemplate(ENUM: SchemaDiffType, modelName: string): string {
    const enums: string[] = [...new Set([...ENUM.enum ?? [], ...ENUM.added, ...ENUM.deleted])];

    return `
    <div id="model-${modelName}" class="model-container" data-name="${modelName}">
        <span class="models-jump-to-path"></span>
        <div class="model-box">
            <span class="model">
                <span class="prop">
                    <span class="model-title prop-name">${modelName}</span>
                    <span class="prop-type">string</span>
                    <span class="prop-enum"><br>
                        Enum:
                        <span>
                            [${enums.map((key: string) => `<span style="background-color: ${
                                ENUM.added.includes(key) 
                                  ? ChangeColor('CREATE') :
                                  (ENUM.deleted.includes(key) ? ChangeColor('DELETE') : ChangeColor('DEFAULT'))
                            }">${key}</span>`).join(', ')}]
                        </span>
                    </span>
                </span>
            </span>
        </div>
    </div>
`
}