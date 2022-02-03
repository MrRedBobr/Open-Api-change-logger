import {SchemasDiffer} from "./schemas-differ";
import {PathsDiffer} from "./paths-differ";
import {SchemasDiffRender} from "./schemas-diff.render";
import {PathsDiffRender} from "./paths-diff.render";
import fs from "fs";

export class Render {
  private readonly pathsRender: PathsDiffRender;
  private readonly schemasRender: SchemasDiffRender;

  normalizeStyle!: string;
  uiStyle!: string;

  constructor(modelsDiff: SchemasDiffer, pathsDiff: PathsDiffer) {
    this.pathsRender = new PathsDiffRender(pathsDiff);
    this.schemasRender = new SchemasDiffRender(modelsDiff);
    this.loadStyles();
  }

  private loadStyles(): void {
    this.normalizeStyle = fs.readFileSync('./src/css/normalize.css', { encoding: 'utf-8' });
    this.uiStyle = fs.readFileSync('./src/css/ui.css', { encoding: 'utf-8' });
  }

  render(): string {
    const endpointsHtml: string = this.pathsRender.render();
    const modelsHtml: string = this.schemasRender.render();

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
            ${endpointsHtml}
            ${modelsHtml}
        </div>
    </body>
    `
  }
}