import { OpenAPIObject } from "@nestjs/swagger/dist/interfaces";
import { OpenApiDiff } from "./open-api-diff";
import { RendererConfigType } from "./types/renderer-config.type";
export declare class ChangeLog {
    private readonly _source;
    private readonly _destination;
    private readonly _converter;
    readonly _openApiDiff: OpenApiDiff;
    private _hbsTemplate;
    constructor(source: OpenAPIObject, destination: OpenAPIObject, config: RendererConfigType);
    readConfig(config: RendererConfigType): void;
    render(): string;
}
//# sourceMappingURL=change-log.d.ts.map