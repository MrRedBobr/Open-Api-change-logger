import {SchemasDiffer} from "./schemas-differ";
import {PathsDiff} from "./paths-diff";
import {SchemasDiffRender} from "./schemas-diff.render";
import {PathsDiffRender} from "./paths-diff.render";
import fs from "fs";

export class Render {
  private readonly pathsRender: PathsDiffRender;
  private readonly schemasRender: SchemasDiffRender;

  constructor(modelsDiff: SchemasDiffer, pathsDiff: PathsDiff) {
    this.pathsRender = new PathsDiffRender(pathsDiff);
    this.schemasRender = new SchemasDiffRender(modelsDiff);

    this.render();
  }

  saveStyles(): void {
    const normalizeStyle: string = fs.readFileSync('./src/css/normalize.css', { encoding: 'utf-8' });
    const uiStyle: string = fs.readFileSync('./src/css/ui.css', { encoding: 'utf-8' });

    fs.writeFileSync('normalize.css', normalizeStyle);
    fs.writeFileSync('ui.css', uiStyle);
  }

  render() {
    const endpointsHtml: string = this.pathsRender.render();
    const modelsHtml: string = this.schemasRender.render();

    const html: string = `
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

    fs.writeFileSync('file.html', html);
    this.saveStyles();
  }
}