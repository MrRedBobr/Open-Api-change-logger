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

    this.pathsRender = new PathsDiffRender(pathsDiff, modelsDiff);
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
    
    <script>
        function modelOpen(event) {
            const button = event.target.parentElement.parentElement.parentElement;
            const container = button.parentElement;
            const modelName = event.target.innerText?.replaceAll('[', '').replaceAll(']', '');
            const modelId = ${'`#model-${modelName}`'}
            const modelExpanded = button.getAttribute('aria-expanded') === 'true';
            
            if(!modelExpanded) {
                button.setAttribute('aria-expanded', 'true');
                
                const braceOpen = document.createElement('span'); //<span class="brace-open object">{</span>
                braceOpen.className = 'brace-open object'
                braceOpen.innerText = '{';
                
                const model = document.querySelector(modelId).querySelector(modelName.toLowerCase().includes('enum') ? 'span.prop-enum' : 'span.inner-object').cloneNode(2);
                
                const braceClose = document.createElement('span');//<span class="brace-close">}</span>
                braceClose.className = 'brace-close'
                braceClose.innerText = '}';
                
                container.appendChild(braceOpen);
                container.appendChild(model);
                container.appendChild(braceClose);
            } else {
                button.setAttribute('aria-expanded', 'false');
                
                const childs = container.children;
                for(let index = childs.length - 1; index !== 0; index--) {
                    childs.item(index).remove();
                }
            }
        }
    </script>
    `
  }
}