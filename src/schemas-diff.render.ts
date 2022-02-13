import {SchemasDiffer} from "./schemas-differ";
import {ChangeTypeEnum, SchemaDiffType, SchemaPropertyType, SchemasDifference} from "./types";
import {ChangeColor} from "./helpers/change-color";

export class SchemasDiffRender {
  protected readonly modelsDiffObj: SchemasDifference;

  constructor(differ: SchemasDiffer) {
    this.modelsDiffObj = differ.schemasDifference;
  }

  render(): string {
    const schemasNames: string[] = Object.keys(this.modelsDiffObj);

    const modelsHtml: string[] = [];

    for (const modelName of schemasNames) {
      const model: SchemaDiffType = this.modelsDiffObj[modelName];

      modelsHtml.push(this.changeSchemaTypeRender(model, modelName));

    }

    const endHtml: string = `
      <div class="wrapper">
        <section class="block col-12 block-desktop col-12-desktop">
          <section class="models is-open">
            <h4>
              <button aria-expanded="true" class="models-control">
                <span>Schemas</span>
              </button>
            </h4>
            <div class="no-margin">
              ${modelsHtml.join('\n')}
            </div>
          </section>
        </section>
      </div>
    `
    return endHtml;
  };

  changeSchemaTypeRender(model: SchemaDiffType, modelName: string): string {
    if(model.type === 'enum') {
      return this.schemaEnumTemplate(model, modelName);
    } else {
      return this.schemaTemplate(model, modelName);
    }
  }

  schemaTemplate(model: SchemaDiffType, modelName: string, useHide: boolean = true): string {
    const propsRowsHtml: string[] = model?.property?.map(
      (prop: SchemaPropertyType) => {
        const propChangeType: ChangeTypeEnum = model.changeType !== ChangeTypeEnum.default && model.changeType !== ChangeTypeEnum.updated ? model.changeType :
          model.added.includes(prop.name) ? ChangeTypeEnum.created :
          model.deleted.includes(prop.name) ? ChangeTypeEnum.deleted :
          ChangeTypeEnum.default;

        return this.schemaPropertyTemplate(prop, propChangeType);
      }
    ) ?? [];

    const modeNameBG: string = ChangeColor(model.changeType);

    return `
      <div id="model-${modelName}" class="model-container ${model.changeType === ChangeTypeEnum.default && useHide ? 'hide' : ''}" data-name="${modelName}">
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
                  <tbody style="background-color: ${modeNameBG}">
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

  schemaPropertyTemplate(prop: SchemaPropertyType, changeType: ChangeTypeEnum, hide: boolean = false): string {
    const changeColor: string = ChangeColor(changeType);
    let child: string = prop.type;

    if(prop.$ref) {
      child = this.renderRefButton(prop.type, prop.$ref);
    }

    return `
<tr class="property-row ${prop.required ? 'required':''} ${prop.deprecated ? 'deprecated' : ''} ${hide ? 'hide' : ''}" style="background-color: ${changeColor}">
  <td>${prop.name}${prop.required ? `<span class="star">*</span>` : ''}</td>
  <td>
    ${ child }
  </td>
</tr>
`
  }

  renderRefButton(type: string, ref: string): string {
    const isArray: boolean = type.includes('[');
    const button: string = `
        <div class="model-box">
          <button aria-expanded="false" class="model-box-control" onclick="modelOpen(event)">
            <span class="pointer">
              <span class="model-title">
                <span class="model-title__text" style="background-color: transparent">${isArray ? '[' : ''}${ref}${isArray ? ']' : ''}</span>
              </span>
            </span>
          </button>
        </div>
      `
    return button;
  }

  schemaEnumTemplate(ENUM: SchemaDiffType, modelName: string): string {
    const enums: string[] = [...new Set([...ENUM.enum ?? [], ...ENUM.added, ...ENUM.deleted])];
    const modeNameBG: string = ENUM.changeType === ChangeTypeEnum.updated ? 'transparent' : ChangeColor(ENUM.changeType);

    return `
    <div class="model-container ${ENUM.changeType === ChangeTypeEnum.default ? 'hide' : ''}">
        <span class="models-jump-to-path"></span>
        <div class="model-box">
            <span class="model">
                <span class="prop" id="model-${modelName}">
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

}