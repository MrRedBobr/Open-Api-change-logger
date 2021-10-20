import { OpenApiDiff } from "./open-api-diff";
import { RendererConfigType } from "./types/renderer-config.type";
export declare class Converter {
    private readonly _changeLog;
    private readonly _config;
    constructor(diffs: OpenApiDiff, config: RendererConfigType);
    private fixedName;
    private changeTypeFromName;
    private getSchemaObjectType;
    private renderSchemas;
    private renderSchema;
    private renderProperties;
    private pathChanges;
    private getPathRenderer;
    private renderParameters;
    changes(): any;
}
//# sourceMappingURL=converter.d.ts.map