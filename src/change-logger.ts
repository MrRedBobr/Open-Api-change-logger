import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";
import {PathsDiffer} from "./paths-differ";
import {SchemasDiffer} from "./schemas-differ";
import {ChangeLogJsonType} from "./types/change-log-json.type";
import {Render} from "./render";
import fs from "fs";
import {ChangeLogRenderSaveType} from "./types/change-log-render-save.type";

export class ChangeLogger {
  private readonly pathDiffer: PathsDiffer;
  private readonly modelsDiffer: SchemasDiffer;
  public readonly oldVersion: string;
  public readonly currentVersion: string;


  constructor(source: OpenAPIObject, destination: OpenAPIObject) {
    this.oldVersion = source.info.version;

    this.pathDiffer = new PathsDiffer(source.paths, destination.paths);
    this.modelsDiffer = new SchemasDiffer(source.components?.schemas ?? {}, destination.components?.schemas ?? {});

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
      return `${major}.${minor}.${Number(maintenance + 1)}`;
    }

    return this.oldVersion;
  }

  public getJson(): ChangeLogJsonType {
    return {
      paths: this.pathDiffer.pathsDiff,
      schemas: this.modelsDiffer.schemasDifference,
    }
  }

  renderAndSave({ path, fileName, format = 'html', pasteVersionInName = false }: ChangeLogRenderSaveType): void {
    const render: Render = new Render(this.modelsDiffer, this.pathDiffer, fileName, this.currentVersion);

    const html: string = render.render();

    const fixPath: string = path[path.length - 1] === '/' ? path : path+'/';

    fs.writeFileSync(`${fixPath}${fileName}${ pasteVersionInName ? `.${this.currentVersion}` : ''}.${format}`, html);
    fs.writeFileSync(`${fixPath}normalize.css`, render.normalizeStyle);
    fs.writeFileSync(`${fixPath}ui.css`, render.uiStyle);
  }

}