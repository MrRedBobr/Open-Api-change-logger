import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import jsonDiff from "json-diff";
import {ChangesGroups} from "./types";

export class OpenApiDiff {
    private _apiObjectDiffs!: OpenAPIObject;
    get apiObjectDiffs(): OpenAPIObject {
        return this._apiObjectDiffs;
    }
    private readonly _source!: OpenAPIObject;
    get source(): OpenAPIObject {
        return this._source;
    }
    private readonly _destination!: OpenAPIObject;
    get destination(): OpenAPIObject {
        return this._destination;
    }

    private readonly _schemasNames: string[] = [];
    get schemasNames(): string[] {
        return this._schemasNames;
    }
    private _hasSchemasChanges: boolean = false;
    private _schemasChangesGroups!: ChangesGroups;

    private readonly _paths: string[] = [];
    get paths(): string[] {
        return this._paths;
    }
    private _hasPathsChanges: boolean = false;
    private _pathsChangesGroups!: ChangesGroups;

    private _version: string = '';
    get version(): string {
        return this._version;
    }

    constructor(source: OpenAPIObject, destination: OpenAPIObject) {
        this._source = source;
        this._destination = destination;

        this._version = source.info.version;

        this.apiDifference();
        this.pathsAndSchemasName();
        this.changes();
        this.apiVersionByChanges();
    }

    private apiDifference(): void {
        this._apiObjectDiffs = jsonDiff.diff(this._source, this._destination);
    }

    private pathsAndSchemasName(): void {
        if (this._apiObjectDiffs?.components?.schemas) {
            this._schemasNames.push(...Object.keys(this._apiObjectDiffs.components.schemas));
            this._hasSchemasChanges = true;
        }
        if (this._apiObjectDiffs.paths) {
            this._paths.push(...Object.keys(this._apiObjectDiffs.paths));
            this._hasPathsChanges = true;
        }
    }

    private changes(): void {
        this._schemasChangesGroups = {
            updated: this._schemasNames.filter((name: string) => !(name.includes('__added') || name.includes('__deleted'))),
            deleted: this._schemasNames.filter((name: string) => name.includes('__deleted')),
            added: this._schemasNames.filter((name: string) => name.includes('__added')),
        };

        this._pathsChangesGroups = {
            updated: this._paths.filter((name: string) => !(name.includes('__added') || name.includes('__deleted'))),
            deleted: this._paths.filter((name: string) => name.includes('__deleted')),
            added: this._paths.filter((name: string) => name.includes('__added')),
        };
    }

    private apiVersionByChanges(): void {
        if (this.hasChanges()) {
            const [major, minor, patch]: [string, string, string] = this._version.split('.') as [string, string, string];

            if (this._pathsChangesGroups.deleted.length > 0) {
                this._version = `${Number(major) + 1}.0.0`;
            } else {
                if (this._pathsChangesGroups.added && this._pathsChangesGroups.updated) {
                    this._version = `${major}.${Number(minor) + 1}.${patch}`;
                } else {
                    this._version = `${major}.${minor}.${Number(patch) + 1}`;
                }
            }
        }
    }

    public hasChanges(): boolean {
        return this._hasPathsChanges || this._hasSchemasChanges;
    }
}