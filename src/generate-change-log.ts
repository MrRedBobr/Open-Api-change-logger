import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";
import {ChangeLogDiffs} from "./change-log-diffs";
import {RendererConfigType} from "./types/renderer-config.type";
import {ChangeLogRenderer} from "./change-log-render";

export class GenerateChangeLog {
    private readonly _source;
    private readonly _destination;
    private readonly renderer: ChangeLogRenderer;

    constructor(source: OpenAPIObject, destination: OpenAPIObject, config: RendererConfigType) {
        this._source = source;
        this._destination = destination;

        const diff: ChangeLogDiffs = new ChangeLogDiffs(source, destination);
        this.renderer = new ChangeLogRenderer(diff, config);
    }

    render(): string {
        return this.renderer.renderHtmlString()
    }
}