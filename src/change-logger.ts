import {PathsDiffer} from "./paths-differ";
import {SchemasDiffer} from "./schemas-differ";
import {ChangeLogJsonType} from "./types/change-log-json.type";
import {Render} from "./render";
import fs from "fs";
import {ChangeLogRenderSaveType} from "./types/change-log-render-save.type";
import {ChangeLoggerSchemasInput} from "./types/change-logger-schemas.input";

/**
 * The main class of this package. It is used to analyze two schemas and generate html file.
 */
export class ChangeLogger {
  private pathDiffer!: PathsDiffer;
  private modelsDiffer!: SchemasDiffer;
  public oldVersion!: string;
  /**
   * Generated api version (compere schemas, update oldSchema version.)
   */
  public currentVersion!: string;

  constructor(input: ChangeLoggerSchemasInput) {
    this.setApiSchemas(input);
  }

  private setApiSchemas(input: ChangeLoggerSchemasInput): void {
    this.oldVersion = input.oldSchema.info.version;

    this.createPathDiffer(input);
    this.createModelsDiffer(input);
    this.generateCurrentVersion();
  }

  private createPathDiffer({ oldSchema, newSchema }: ChangeLoggerSchemasInput): void {
    this.pathDiffer = new PathsDiffer(oldSchema.paths, newSchema.paths);
  }
  private createModelsDiffer({ oldSchema, newSchema }: ChangeLoggerSchemasInput): void {
    this.modelsDiffer = new SchemasDiffer(oldSchema.components?.schemas ?? {}, newSchema.components?.schemas ?? {});
  }
  private generateCurrentVersion(): void {
    this.currentVersion = this.generateChangeVersion();
  }

  private generateChangeVersion(): string {
    const [major = '0', minor = '0', maintenance = '0']: [string, string, string] = this.oldVersion.split('.') as [string, string, string];

    if(this.pathDiffer.hasDeleted) {
      return `${Number(major) + 1}.0.0`;
    }

    if (this.pathDiffer.hasUpdate || this.modelsDiffer.hasDeleteOrCreate || this.pathDiffer.hasCreated) {
      return `${major}.${Number(minor) + 1}.0`;
    }

    if (this.modelsDiffer.hasUpdate) {
      return `${major}.${minor}.${Number(maintenance) + 1}`;
    }

    return this.oldVersion;
  }

  /**
   * Returns you a json comparing the two schemes.
   */
  getJson(): ChangeLogJsonType {
    return {
      paths: this.pathDiffer.pathsDiff,
      schemas: this.modelsDiffer.schemasDifference,
    }
  }

  /**
   * save change log files (1 html, 2 css).
   */
  renderAndSave({ path, fileName, format = 'html', pasteVersionInName = false }: ChangeLogRenderSaveType): void {
    const render: Render = new Render(this.modelsDiffer, this.pathDiffer, fileName, this.currentVersion);

    const html: string = render.render();

    const fixPath: string = path[path.length - 1] === '/' ? path : path+'/';

    fs.writeFileSync(`${fixPath}${fileName}${ pasteVersionInName ? `.${this.currentVersion}` : ''}.${format}`, html);
    fs.writeFileSync(`${fixPath}normalize.css`, Render.normalizeStyle);
    fs.writeFileSync(`${fixPath}ui.css`, Render.uiStyle);
  }

  /**
   * You wanna to change api schemas? Use it
   * @param input new schemas
   */
  changeSchemas(input: ChangeLoggerSchemasInput): void {
    this.setApiSchemas(input);
  }

  /**
   * Don't wanna to save files? Use it to get html string. It not includes styles, but include <script></script> tag.
   * @param apiName api name. It will be in the title.
   * @return {string} html file in string.
   */
  getHtmlString(apiName: string): string {
    const render: Render = new Render(this.modelsDiffer, this.pathDiffer, apiName, this.currentVersion);
    return render.render();
  }

  /**
   * don't wanna to save files? Use it to get styles string. But it not includes html.
   * @return {string} css file in string.
   */
  getStyleString(): string {
    return `
      ${Render.normalizeStyle}
      ${Render.uiStyle}
    `
  }
}