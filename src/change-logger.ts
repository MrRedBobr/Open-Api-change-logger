import fs from "fs";
import path from "path";

import { PathsDiffer } from "./paths-differ";
import { Render } from "./render";
import { SchemasDiffer } from "./schemas-differ";
import { ChangeLogJsonType } from "./types/change-log-json.type";
import { ChangeLogRenderSaveType } from "./types/change-log-render-save.type";
import { ChangeLoggerSchemasInput } from "./types/change-logger-schemas.input";

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

  private createPathDiffer({
    oldSchema,
    newSchema,
  }: ChangeLoggerSchemasInput): void {
    this.pathDiffer = new PathsDiffer(oldSchema.paths, newSchema.paths);
  }

  private createModelsDiffer({
    oldSchema,
    newSchema,
  }: ChangeLoggerSchemasInput): void {
    this.modelsDiffer = new SchemasDiffer(
      oldSchema.components?.schemas ?? {},
      newSchema.components?.schemas ?? {}
    );
  }

  private generateCurrentVersion(): void {
    this.currentVersion = this.generateChangeVersion();
  }

  private generateChangeVersion(): string {
    const [major = "0", minor = "0", maintenance = "0"]: [
      string,
      string,
      string
    ] = this.oldVersion.split(".") as [string, string, string];

    if (this.pathDiffer.hasDeleted) {
      return `${Number(major) + 1}.0.0`;
    }

    if (
      this.pathDiffer.hasUpdate ||
      this.modelsDiffer.hasDeleteOrCreate ||
      this.pathDiffer.hasCreated
    ) {
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
    };
  }

  /**
   * save change log files (1 html, 2 css).
   * @deprecated
   */
  renderAndSave({
    path,
    fileName,
    format = "html",
    pasteVersionInName = false,
  }: ChangeLogRenderSaveType): void {
    const render: Render = new Render(
      this.modelsDiffer,
      this.pathDiffer,
      fileName,
      this.currentVersion
    );

    const html: string = render.render();

    const fixPath: string = path[path.length - 1] === "/" ? path : `${path}/`;

    fs.writeFileSync(
      `${fixPath}${fileName}${
        pasteVersionInName ? `.${this.currentVersion}` : ""
      }.${format}`,
      html
    );
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
   * Don't wanna to save files? Use it to get html string. It not includes style, but include <script></script> tag.
   * @param apiName api name. It will be in the title.
   * @param stylePath relative path to style file
   * @return {string} html file in string.
   */
  private getHtmlString(apiName: string, stylePath?: string): string {
    const render: Render = new Render(
      this.modelsDiffer,
      this.pathDiffer,
      apiName,
      this.currentVersion
    );
    return render.render(stylePath);
  }

  /**
   * don't wanna to save files? Use it to get style string. But it not includes html.
   * @return {string} css file in string.
   */
  private getStyleString(): string {
    return `
      ${Render.normalizeStyle}
      ${Render.uiStyle}
    `;
  }

  /**
   * @param stylesFolder absolute path to style folder
   * @param htmlFolder absolute path to html folder
   * @param apiName api name (used for html file name)
   *
   * @example changeLogger.saveFiles({
   *   htmlFolder: path.join(__dirname, 'files', 'html'),
   *   stylesFolder: path.join(__dirname, 'files', 'style'),
   *   apiName: 'test-api'
   * })
   */
  saveFiles({
    stylesFolder,
    htmlFolder,
    apiName,
  }: {
    stylesFolder: string;
    htmlFolder: string;
    apiName: string;
  }): void {
    let stylePath: string = path.relative(`${htmlFolder}`, `${stylesFolder}`);

    stylePath = path.join(stylePath, "style.css").replaceAll("\\", "/");

    const html: string = this.getHtmlString(apiName, stylePath);
    const styles: string = this.getStyleString();

    fs.writeFileSync(
      path.join(htmlFolder, `${apiName}.${this.currentVersion}.html`),
      html
    );
    fs.writeFileSync(path.join(stylesFolder, `style.css`), styles);
  }
}
