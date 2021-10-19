import { ChangeLogDiffs } from "./change-log-diffs";
import { RendererConfigType } from "./types/renderer-config.type";
export declare class ChangeLogRenderer {
    private readonly _changeLog;
    private readonly _config;
    private _hbsTemplate;
    constructor(diffs: ChangeLogDiffs, config: RendererConfigType);
    readConfig(): void;
    private fixedName;
    private changeTypeFromName;
    private getSchemaObjectType;
    private renderSchemas;
    private renderSchema;
    private renderProperties;
    private pathChanges;
    private getPathRenderer;
    private renderParameters;
    renderHtmlString(): string;
}
//# sourceMappingURL=change-log-render.d.ts.map