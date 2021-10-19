import { OpenAPIObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
export declare class ChangeLogDiffs {
    private _apiObjectDiffs;
    get apiObjectDiffs(): OpenAPIObject;
    private readonly _source;
    get source(): OpenAPIObject;
    private readonly _destination;
    get destination(): OpenAPIObject;
    private readonly _schemasNames;
    get schemasNames(): string[];
    private _hasSchemasChanges;
    private _schemasChangesGroups;
    private readonly _paths;
    get paths(): string[];
    private _hasPathsChanges;
    private _pathsChangesGroups;
    private _version;
    get version(): string;
    constructor(source: OpenAPIObject, destination: OpenAPIObject);
    private apiDifference;
    private pathsAndSchemasName;
    private changes;
    private apiVersionByChanges;
    hasChanges(): boolean;
}
//# sourceMappingURL=change-log-diffs.d.ts.map