import {SchemasDiffer} from "./schemas-differ";
import {PathsDiffer} from "./paths-differ";
import {SchemasDiffRender} from "./schemas-diff.render";
import {PathsDiffRender} from "./paths-diff.render";
import {InformationTemplate} from "./templates/information.template";
import {Normalize} from "./css/normalize";
import {Ui} from "./css/ui";

export class Render {
  private readonly pathsRender: PathsDiffRender;
  private readonly schemasRender: SchemasDiffRender;
  private readonly apiName: string;
  private readonly currentVersion: string;

  normalizeStyle!: string;
  uiStyle!: string;

  constructor(modelsDiff: SchemasDiffer, pathsDiff: PathsDiffer, apiName: string, currentVersion: string) {
    this.pathsRender = new PathsDiffRender(pathsDiff);
    this.schemasRender = new SchemasDiffRender(modelsDiff);
    this.apiName = apiName;
    this.currentVersion = currentVersion;
    this.loadStyles();
  }

  private loadStyles(): void {
    this.normalizeStyle = Normalize;
    this.uiStyle = Ui;
  }

  render(): string {
    const endpointsHtml: string = this.pathsRender.render();
    const modelsHtml: string = this.schemasRender.render();
    const informationHtml: string = InformationTemplate(this.apiName, this.currentVersion);

    return `
    <link rel="stylesheet" type="text/css" href="normalize.css">
    <link rel="stylesheet" type="text/css" href="ui.css">
    
    <style>
      html {
          box-sizing: border-box;
          overflow: -moz-scrollbars-vertical;
          overflow-y: scroll;
      }
      
      *,
      *:before,
      *:after {
          box-sizing: inherit;
      }
      
      body {
          margin: 0;
          background: #fafafa;
      }
    </style>

    <body>
        <div class="swagger-ui">
            ${informationHtml} 
            ${endpointsHtml}
            ${modelsHtml}
        </div>
    </body>
    `
  }
}