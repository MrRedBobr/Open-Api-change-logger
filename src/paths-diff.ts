import {OperationObject, PathItemObject, PathsObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {OperationsConverter} from "./operations-diff";
import {
  Operation,
  OperationsChanges,
  PathParameter,
  PathParameterDiff,
  PathsDiffType, Schema,
  SchemaPropertyDiff
} from "./types";
import {ChangeType} from "./types/change.type";
import {EnumDiffType} from "./types/enum-diff.type";
import {SchemasDiffer} from "./schemas-differ";
import {ResponsesTypeObject} from "./types/responsesTypeObject";
import {ResponsesDiffObjectType} from "./types/responses-diff-object.type";

export class PathsDiff {
  operationsKeys: string[] = [
    'get',
    'put',
    'post',
    'delete',
    'patch',
  ]
  source: PathsObject;
  destination: PathsObject;

  pathsDiff: PathsDiffType;

  constructor(source: PathsObject, destination: PathsObject) {
    this.source = source;
    this.destination = destination;

    this.pathsDiff = this.diff(source, destination);
  }

  diff(oldPaths: PathsObject, newPaths: PathsObject): PathsDiffType {
    const paths_addresses: string[] = [...new Set<string>([...Object.keys(oldPaths), ...Object.keys(newPaths)])];
    const paths: PathsDiffType = {};

    for (const path_address of paths_addresses) {
      const source: PathItemObject = oldPaths[path_address];
      const destination: PathItemObject = newPaths[path_address];

      if (source && destination) {//update or no changes
        paths[path_address] = this.pathItemUpdate(source, destination, path_address);
      } else if (source && !destination) {//delete
        paths[path_address] = this.pathItemDeleteOrCreate(source, 'DELETE');
      } else if (!source && destination) {//create
        paths[path_address] = this.pathItemDeleteOrCreate(destination, 'CREATE');
      }
    }
    return paths;
  }

  pathItemUpdate(oldPath: PathItemObject, newPath: PathItemObject, s: string): OperationsChanges {
    const operationsNames: string[] = [...new Set<string>([...(oldPath ? Object.keys(oldPath) : []), ...Object.keys(newPath)])].filter((v: string) => this.operationsKeys.includes(v));
    const operations: OperationsChanges = {};

    for (const operation of operationsNames) {
      const oldOperation: Operation = OperationsConverter.convertingToNormal(oldPath[operation as keyof PathItemObject] as OperationObject);
      const newOperation: Operation = OperationsConverter.convertingToNormal(newPath[operation as keyof PathItemObject] as OperationObject);

      const pathParameters: PathParameterDiff[] = this.parametersDiff(oldOperation.pathParameters ?? [], newOperation.pathParameters ?? []);
      const request: SchemaPropertyDiff = this.requestDiff(oldOperation.request, newOperation.request);

      const { responses, hasChanges } = this.responseDiff(oldOperation.response);

      const isUpdated: boolean =
        (request.added.length > 0 && request.deleted.length > 0)
        || hasChanges
        || pathParameters.reduce(
          (previousValue: boolean, currentValue: PathParameterDiff): boolean =>
            (currentValue.added.length > 0 && currentValue.deleted.length > 0)
          , false
        );

      operations[operation] = {
        changeType: isUpdated ? 'UPDATE' : 'DEFAULT',
        pathParameters,
        request,
        responses,
        deprecated: newOperation.deprecated,
      }
    }
    return operations;
  }

  pathItemDeleteOrCreate(oldPath: PathItemObject, changeType: ChangeType): OperationsChanges {
    const operationsNames: string[] = [...new Set<string>([...(oldPath ? Object.keys(oldPath) : [])])].filter((v: string) => this.operationsKeys.includes(v));
    const operations: OperationsChanges = {};

    for (const operation of operationsNames) {
      const oldOperation: Operation = OperationsConverter.convertingToNormal(oldPath[operation as keyof PathItemObject] as OperationObject);

      const pathParameters: PathParameterDiff[] = this.parametersDiff(oldOperation?.pathParameters, []);

      const request: SchemaPropertyDiff = this.requestDiff(oldOperation.request, []);

      const { responses, hasChanges } = this.responseDiff(oldOperation.response);

      operations[operation] = {
        changeType: hasChanges ? 'UPDATE' : changeType,
        pathParameters,
        request,
        responses,
        deprecated: oldOperation.deprecated
      }
    }

    return operations;
  }

  parametersDiff(oldParams: PathParameter[], newParams: PathParameter[]): PathParameterDiff[] {
    const oldNames: string[] = oldParams.map(({name}: PathParameter) => name);
    const newNames: string[] = newParams.map(({name}: PathParameter) => name);

    const paramsNames: string[] = [...new Set<string>([
      ...newNames,
      ...oldNames,
    ])];

    const params: PathParameterDiff[] = [];

    for (const name of paramsNames) {
      const old: PathParameter | undefined = oldParams.find((param: PathParameter) => param.name === name);
      const new_: PathParameter | undefined = newParams.find((param: PathParameter) => param.name === name);

      if (old && new_) {//updated or not changed
        params.push(this.parameterUpdate(old, new_));
      } else if (old && !new_) {//deleted
        params.push(this.parameterCreateOrDelete(old, 'DELETE'));
      } else if (!old && new_) {//created
        params.push(this.parameterCreateOrDelete(new_, 'CREATE'));
      }
    }
    return params;
  }

  parameterUpdate(oldParameter: PathParameter, newParameter: PathParameter): PathParameterDiff {
    let schemaDiff: PathParameterDiff = {
      name: oldParameter.name,
      placed: newParameter.placed,
      type: oldParameter.type!,
      deprecated: oldParameter.deprecated ?? oldParameter.deprecated ?? false,
      ...(oldParameter.$ref && {'$ref': oldParameter.$ref}),
      ...(newParameter.$ref && {'$ref': newParameter.$ref}),
      required: newParameter.required,

      deleted: [],
      added: [],
      changeType: "DEFAULT",
    };

    const type: string = oldParameter.enum ? 'enum' : oldParameter.type!;

    if (type === 'enum' && oldParameter.enum && newParameter.enum) { //if type is enum
      const diffEnum: EnumDiffType = SchemasDiffer.diffForEnum(oldParameter.enum, newParameter.enum);
      return {
        ...schemaDiff,
        changeType: diffEnum.added.length > 0 || diffEnum.deleted.length > 0 ? 'UPDATE' : 'DEFAULT',
        ...diffEnum,
      }
    }

    if (type === 'object' && oldParameter.property && newParameter.property) {
      const schemaPropertyDiff: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldParameter.property, newParameter.property ?? []);

      return {
        ...schemaDiff,
        changeType: schemaPropertyDiff.added.length > 0 || schemaPropertyDiff.deleted.length > 0 ? 'UPDATE' : 'DEFAULT',
        ...schemaPropertyDiff,
      }
    }

    return schemaDiff;
  }

  parameterCreateOrDelete(parameter: PathParameter, changeType: ChangeType): PathParameterDiff {
    let schemaDiff: PathParameterDiff = {
      name: parameter.name,
      placed: parameter.placed,
      type: parameter.type!,
      deprecated: parameter.deprecated ?? parameter.deprecated ?? false,
      ...(parameter.$ref && {'$ref': parameter.$ref}),
      required: parameter.required,

      deleted: [],
      added: [],
      changeType,
    };
    const type: string = parameter.enum ? 'enum' : parameter.type!;

    if (type === 'enum' && parameter.enum) { //if type is enum
      const diffEnum: EnumDiffType = SchemasDiffer.diffForEnum(parameter.enum, []);
      return {
        ...schemaDiff,
        ...diffEnum,
      }
    }

    if (type === 'object' && parameter.property) {
      const schemaPropertyDiff: SchemaPropertyDiff = SchemasDiffer.diffForProperty(parameter.property, []);

      return {
        ...schemaDiff,
        ...schemaPropertyDiff,
      }
    }

    return schemaDiff;
  }

  requestDiff(oldRequest: Schema[], newRequest: Schema[]): SchemaPropertyDiff {
    const oldReq: Schema|undefined = oldRequest[0];
    const newReq: Schema|undefined = newRequest[0];

    if(!oldReq || !newReq) {
      return {
        added: [],
        deleted: [],
      };
    }

    if(oldReq?.$ref && newReq?.$ref) {
      const equals: boolean = oldReq.$ref === newReq.$ref;

      return {
        added: equals ? [] : [newReq.$ref],
        deleted: equals ? [] : [oldReq.$ref],
        $ref: newReq.$ref,
      }
    }

    const schemaPropertyDiff: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldReq.property ?? [], newReq.property ?? []);

    return {
      ...schemaPropertyDiff,
      ...(oldReq?.$ref && { deleted: [oldReq.$ref, ...schemaPropertyDiff.deleted] }),
      ...(newReq?.$ref && { added: [newReq.$ref, ...schemaPropertyDiff.added] }),
    };
  }

  responseDiff(oldResponses: ResponsesTypeObject, newResponses?: ResponsesTypeObject): { responses: ResponsesDiffObjectType, hasChanges: boolean } {
    const oldKeys: string[] = Object.keys(oldResponses);
    const newKeys: string[] = Object.keys(newResponses ?? {});

    const keys: string[] = [...new Set([...oldKeys, ...newKeys])];

    const createdKeys: string[] = keys.filter((v: string) => !oldKeys.includes(v));
    const deletedKeys: string[] = keys.filter((v: string) => !newKeys.includes(v) && newKeys.length > 0);

    const responses: ResponsesDiffObjectType = {};
    let hasChanges: boolean = false;

    for(const key of keys) {
      const oldResponse: Schema[] = oldResponses[key] ?? [];
      const newResponse: Schema[] = newResponses ? newResponses[key] : [];
      const diff: SchemaPropertyDiff = this.requestDiff(oldResponse, newResponse);

      const changeType: ChangeType = createdKeys.includes(key)
        ? 'CREATE'
        : (
          deletedKeys.includes(key)
            ? 'DELETE'
            : (diff.added.length > 0 || diff.deleted.length > 0 ? 'UPDATE' : 'DEFAULT')
        )

      if(hasChanges && changeType !== 'DEFAULT') {
        hasChanges = true;
      }

      responses[key] = {
        changeType: changeType,
        ...diff,
      }
    }

    return { responses, hasChanges };
  }
}