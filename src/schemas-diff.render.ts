import {SchemasDiffer} from "./schemas-differ";
import {SchemaDiffType, SchemasDifference} from "./types";
import {SchemaEnumTemplate} from "./schema-enum.template";
import {SchemaTemplate} from "./templates/schema.template";

export class SchemasDiffRender {
  private readonly diffs: SchemasDifference;

  constructor(differ: SchemasDiffer) {
    this.diffs = differ.schemasDifference;
  }

  render(): string {
    const schemasNames: string[] = Object.keys(this.diffs);

    const modelsHtml: string[] = [];

    for(const modelName of schemasNames) {
      const model: SchemaDiffType = this.diffs[modelName];
      if(model.type === 'enum') {
        const enumHtml: string = SchemaEnumTemplate(model, modelName);
        modelsHtml.push(enumHtml);
      } else {
        const objHtml: string = SchemaTemplate(model, modelName);
        modelsHtml.push(objHtml);
      }
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


}