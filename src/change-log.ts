import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";
import {OpenApiDiff} from "./open-api-diff";
import {RendererConfigType} from "./types/renderer-config.type";
import {Converter} from "./converter";
import fs from "fs";
import path from "path";
import Handlebars, {HelperOptions} from "handlebars";

export class ChangeLog {
    private readonly _source;
    private readonly _destination;
    private readonly _converter: Converter;
    public readonly _openApiDiff: OpenApiDiff;
    private _hbsTemplate!: string;

    constructor(source: OpenAPIObject, destination: OpenAPIObject, config: RendererConfigType) {
        this._source = source;
        this._destination = destination;

        const diff: OpenApiDiff = new OpenApiDiff(source, destination);
        this._openApiDiff = diff;

        this._converter = new Converter(diff, config);
        this.readConfig(config);
    }

    readConfig(config: RendererConfigType): void {
        if(config.hbsTemplate) {
            this._hbsTemplate = config.hbsTemplate;
        } else {
            this._hbsTemplate = fs.readFileSync(path.join(__dirname, '..', 'template', 'template.hbs'), 'utf8');
        }
    }

    render(): string {
        Handlebars.registerHelper('includes', (value: string, str: string, options: HelperOptions) => {
            if (value.includes(str)) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        const hbs: HandlebarsTemplateDelegate = Handlebars.compile(this._hbsTemplate);

        return hbs(this._converter.changes());
    }
}