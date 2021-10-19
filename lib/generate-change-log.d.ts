import { OpenAPIObject } from "@nestjs/swagger/dist/interfaces";
import { RendererConfigType } from "./types/renderer-config.type";
export declare class GenerateChangeLog {
    private readonly _source;
    private readonly _destination;
    private readonly renderer;
    constructor(source: OpenAPIObject, destination: OpenAPIObject, config: RendererConfigType);
    render(): string;
}
//# sourceMappingURL=generate-change-log.d.ts.map