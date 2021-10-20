import {OpenApiDiff} from "./open-api-diff";
import {RendererConfigType} from "./types/renderer-config.type";
import fs from "fs";
import path from "path";
import {ChangeType, EnumProperty, GroupedPathsChangesType, Path, Properties, Schema} from "./types";
import {
    ParameterObject,
    PathItemObject,
    ReferenceObject, RequestBodyObject,
    SchemaObject
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import Handlebars, {HelperOptions} from "handlebars";
import {FindPathChangesType} from "./types/find-path-changes.type";

export class Converter {
    private readonly _changeLog!: OpenApiDiff;
    private readonly _config: RendererConfigType;

    constructor(diffs: OpenApiDiff,config: RendererConfigType) {
        this._changeLog = diffs;
        this._config = config;
    }

    private fixedName(field: string): string {
        return field.replace('__added', '').replace('__deleted', '');
    }

    private changeTypeFromName(field: string): ChangeType {
        return field.includes('__deleted') || field.includes('__added') ? (field.includes('__deleted') ? 'Deleted' : 'Added') : '';
    }

    private getSchemaObjectType(schema: SchemaObject): string {
        let type: string = schema.type ?? '';
        type = schema.type && schema.type === 'array' ? `[${(schema.items as SchemaObject)['type'] ?? (schema.items as ReferenceObject)['$ref']?.split('/').pop()}]` : type;
        type = schema.type && schema.type === 'string' && schema.enum ? `enum` : type;
        if (schema.allOf) {
            const refTypeName: string = (schema.allOf[0] as ReferenceObject).$ref.split('/').pop() ?? '';
            type = refTypeName;
        }
        return type;
    }

    private renderSchemas(): {
        updated: Schema[];
        created: Schema[];
        deleted: Schema[];
    } {
        const updatedSchemas: string[] = this._changeLog.schemasNames.filter((name: string) => !(name.includes('__added') || name.includes('__deleted')));
        const deletedSchemas: string[] = this._changeLog.schemasNames.filter((name: string) => name.includes('__deleted'));
        const addedSchemas: string[] =this._changeLog.schemasNames.filter((name: string) => name.includes('__added'));

        const updated: Schema[] = updatedSchemas.map((name: string) => {
            const schema: SchemaObject = this._changeLog.destination.components!.schemas![name] as SchemaObject;
            const diffSchema: SchemaObject & any = this._changeLog.apiObjectDiffs.components!.schemas![name];

            const type: string = this.getSchemaObjectType(schema);

            return this.renderSchema('Update', type, name, name, schema, diffSchema);
        });

        const deleted: Schema[] = deletedSchemas.map((name: string) => {
            const fixedName: string = this.fixedName(name);

            const schema: SchemaObject = this._changeLog.source.components!.schemas![fixedName] as SchemaObject;
            const diffSchema: SchemaObject & any = this._changeLog.apiObjectDiffs.components!.schemas![fixedName];

            const type: string = this.getSchemaObjectType(schema);

            return this.renderSchema('Deleted', type, name, fixedName, schema, diffSchema);
        });

        const created: Schema[] = addedSchemas.map((name: string) => {
            const fixedName: string = this.fixedName(name);

            const schema: SchemaObject = this._changeLog.destination.components!.schemas![fixedName] as SchemaObject;
            const diffSchema: SchemaObject & any = this._changeLog.apiObjectDiffs.components!.schemas![fixedName];

            const type: string = this.getSchemaObjectType(schema);

            return this.renderSchema('Added', type, name, fixedName, schema, diffSchema);
        });

        return {
            updated,
            created,
            deleted,
        };
    }

    private renderSchema(
        changeType: string,
        type: string,
        name: string,
        fixedName: string,
        schema: SchemaObject,
        diffSchema: SchemaObject & any,
    ): Schema {
        return {
            changeType: changeType,
            name: fixedName,
            type,
            ...(type !== 'enum' && {
                properties: this.renderProperties(
                    schema.properties!,
                    (this._changeLog.apiObjectDiffs.components!.schemas![name] as SchemaObject)?.properties,
                    (this._changeLog.source.components!.schemas![name] as SchemaObject)?.properties!,
                ),
            }),
            ...(type === 'enum' && {
                ...(Array.isArray(diffSchema?.enum[0])
                    ? {
                        enum: diffSchema.enum.map(
                            ([type, value]: [string, string]): EnumProperty => {
                                const changeType: ChangeType = type === '+' || type === '-' ? (type === '-' ? 'Deleted' : 'Added') : '';
                                return {
                                    changeType,
                                    isAdded: type === '+',
                                    isDelete: type === '-',
                                    noChanges: type === ' ',
                                    name: value,
                                };
                            },
                        ),
                    }
                    : { enum: schema.enum!.map((name: any) => ({ name, noChanges: true })) }),
            }),
        };
    }

    private renderProperties(
        destinationSchemaProperties: Record<string, SchemaObject | ReferenceObject>,
        diffProperties: any,
        sourceSchemaProperties: Record<string, SchemaObject | ReferenceObject>,
    ): Properties {
        if (destinationSchemaProperties && diffProperties) {
            const updatedKeys: string[] = Object.keys(diffProperties);
            const fixedUpdatedKeys: string[] = updatedKeys.map((key: string) => this.fixedName(key));
            const keys: Set<string> = new Set<string>([...Object.keys(destinationSchemaProperties), ...fixedUpdatedKeys]);
            const newProperties: Properties = {};

            for (const key of keys) {
                const index: number = updatedKeys.findIndex((name: string) => name.includes(key));
                const changeType: ChangeType = index !== -1 ? this.changeTypeFromName(updatedKeys[index]) : '';
                const noChanges: boolean = index === -1 || updatedKeys[index] === key;

                const type: string =
                    changeType !== 'Deleted'
                        ? this.getSchemaObjectType(destinationSchemaProperties[key] as SchemaObject)
                        : this.getSchemaObjectType(sourceSchemaProperties[key] as SchemaObject);

                newProperties[key] = {
                    changeType,
                    isDelete: changeType === 'Deleted',
                    isAdded: changeType === 'Added',
                    noChanges,
                    type,
                };
            }

            return newProperties;
        }
        return {};
    }

    private pathChanges({ name, pathDiffs, parameterObjects, pathType, requestBody, changeType }: FindPathChangesType): Path {
        return {
            name,
            isGet: pathType === 'get',
            isPatch: pathType === 'patch',
            isPost: pathType === 'post',
            isDelete: pathType === 'delete',
            pathType: pathType,
            ...(parameterObjects?.length > 0 && {
                parameters: this.renderParameters(
                    parameterObjects,
                    pathDiffs
                )
            }),
            ...(requestBody && {
                body: (requestBody.content['application/json'].schema as ReferenceObject)?.$ref?.split('/')?.pop() ?? '',
            }),
            changeType
        }
    }

    private getPathRenderer(): GroupedPathsChangesType {
        const updatedPaths: string[] = this._changeLog.paths.filter((name: string) => !(name.includes('__added') || name.includes('__deleted')));
        const deletePaths: string[] = this._changeLog.paths.filter((name: string) => name.includes('__deleted'));
        const createPaths: string[] = this._changeLog.paths.filter((name: string) => name.includes('__added'));

        // eslint-disable-next-line complexity
        const updated: Path[][] = updatedPaths.map((name: string): Path[] => {
            const path: PathItemObject = this._changeLog.destination.paths[name];

            const pathsChanges: Path[] = [];

            const getType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('get'));
            if (path.get && getType) {
                const pathChange: Path = this.pathChanges({
                    name,
                    pathType: 'get',
                    parameterObjects: path.get.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[getType].parameters as ParameterObject[],
                    changeType: this.changeTypeFromName(getType)
                })
                pathsChanges.push(pathChange);
            }
            const postType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('post'));
            if (path.post && postType) {
                const postChange: Path = this.pathChanges({
                    name,
                    pathType: 'post',
                    parameterObjects: path.post.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[postType]!.parameters as ParameterObject[],
                    requestBody: path.post.requestBody as RequestBodyObject,
                    changeType: this.changeTypeFromName(postType)
                })

                pathsChanges.push(postChange);
            }

            const patchType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('patch'));
            if (path.patch && patchType) {
                const patchChange: Path = this.pathChanges({
                    name,
                    pathType: 'patch',
                    parameterObjects: path.patch.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[patchType]!.parameters as ParameterObject[],
                    requestBody: path.patch.requestBody as RequestBodyObject,
                    changeType: this.changeTypeFromName(patchType)
                })

                pathsChanges.push(patchChange);
            }

            const deleteType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('delete'));
            if(path.delete && deleteType) {
                const pathChange: Path = this.pathChanges({
                    name,
                    pathType: 'delete',
                    parameterObjects: path.delete.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[deleteType].parameters as ParameterObject[],
                    changeType: this.changeTypeFromName(deleteType) ?? 'Deleted',
                })
                pathsChanges.push(pathChange);
            }

            return pathsChanges;
        });

        const deleted: Path[][] = deletePaths.map((name: string): Path[] => {
            const fixedName: string = this.fixedName(name);

            const path: PathItemObject = this._changeLog.source.paths[fixedName];

            const deletedPaths: Path[] = [];

            const getType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('get'));
            if (path.get && getType) {
                const pathChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'get',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: this.changeTypeFromName(getType) ?? 'Deleted',
                })
                deletedPaths.push(pathChange);
            }

            const postType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('post'));
            if (path.post && postType) {
                const pathChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'post',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: this.changeTypeFromName(postType) ?? 'Deleted',
                })
                deletedPaths.push(pathChange);
            }

            const patchType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('patch'));
            if (path.patch && patchType) {
                const pathChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'patch',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: this.changeTypeFromName(patchType) ?? 'Deleted',
                })
                deletedPaths.push(pathChange);
            }

            const deleteType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('delete'));
            if(path.delete && deleteType) {
                const pathChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'delete',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: this.changeTypeFromName(deleteType) ?? 'Deleted',
                })
                deletedPaths.push(pathChange);
            }

            return deletedPaths;
        });

        // eslint-disable-next-line complexity
        const created: Path[][] = createPaths.map((name: string): Path[] => {
            const fixedName: string = this.fixedName(name);

            const path: PathItemObject = this._changeLog.destination.paths[fixedName];

            const createdPaths: Path[] = [];

            const getType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('get'));
            if (path.get && getType) {
                const pathChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'get',
                    parameterObjects: path.get.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[getType].parameters as ParameterObject[],
                    changeType: this.changeTypeFromName(getType)
                })

                createdPaths.push(pathChange);
            }

            const postType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('post'));
            if (path.post && postType) {
                const postChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'post',
                    parameterObjects: path.post.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[postType]!.parameters as ParameterObject[],
                    requestBody: path.post.requestBody as RequestBodyObject,
                    changeType: this.changeTypeFromName(postType)
                })

                createdPaths.push(postChange);
            }

            const patchType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('patch'));
            if (path.patch && patchType) {
                const patchChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'patch',
                    parameterObjects: path.patch.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[patchType]!.parameters as ParameterObject[],
                    requestBody: path.patch.requestBody as RequestBodyObject,
                    changeType: this.changeTypeFromName(patchType)
                })

                createdPaths.push(patchChange);
            }

            const deleteType: string|undefined = Object.keys(this._changeLog.apiObjectDiffs.paths[name]).find((name: string) => name.includes('delete'));
            if(path.delete && deleteType) {
                const pathChange: Path = this.pathChanges({
                    name: fixedName,
                    pathType: 'delete',
                    parameterObjects: path.delete.parameters as ParameterObject[],
                    pathDiffs: (this._changeLog.apiObjectDiffs.paths[name] as any)[deleteType].parameters as ParameterObject[],
                    changeType: this.changeTypeFromName(deleteType) ?? 'Deleted',
                })
                createdPaths.push(pathChange);
            }

            return createdPaths;
        });

        return {
            updated: updated.flat(),
            created: created.flat(),
            deleted: deleted.flat(),
        };
    }

    private renderParameters(parameters: ParameterObject[], diffParameters: any[]): Properties {
        const params: Properties = {};

        for (const [index, parameter] of parameters.entries()) {
            const type: string = this.getSchemaObjectType(parameter.schema as SchemaObject);
            if (Array.isArray(diffParameters[index]) && diffParameters[index]?.length > 1) {
                let changeType: ChangeType = '';
                if (diffParameters[index][0] === '+' || diffParameters[index][0] === '-') {
                    changeType = diffParameters[index][0] === '+' ? 'Added' : 'Deleted';
                }
                params[parameter.name] = {
                    changeType,
                    ...(diffParameters[index][1].schema?.type && { type: this.getSchemaObjectType(diffParameters[index][1].schema) }),
                    ...(diffParameters[index][1].schema?.enum && {
                        enum: diffParameters[index][1].schema.enum.map(
                            ([type, value]: [string, string]): EnumProperty => {
                                const changeType: ChangeType = type === '+' || type === '-' ? (type === '-' ? 'Deleted' : 'Added') : '';
                                return {
                                    changeType,
                                    isAdded: type === '+',
                                    isDelete: type === '-',
                                    noChanges: type === ' ',
                                    name: value,
                                };
                            },
                        ),
                    }),
                };
            } else {
                params[parameter.name] = {
                    changeType: '',
                    type,
                };
            }
        }

        return params;
    }

    changes(): any {
        const { hbsTemplate, apiName, ...other }: RendererConfigType = this._config;
        return {
            schemas: this.renderSchemas(),
            paths: this.getPathRenderer(),
            name: apiName,
            version: this._changeLog.version,
            ...other
        }
    }
}