import {OperationObject, PathItemObject, PathsObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {OperationsConverter} from "./operations-converter";
import {
  Operation,
  OperationsChanges,
  PathParameter,
  PathParameterDiff,
  PathsDiffType,
  Schema,
  SchemaPropertyDiff
} from "./types";
import {ChangeTypeEnum} from "./types";
import {EnumDiffType} from "./types";
import {SchemasDiffer} from "./schemas-differ";
import {ResponsesTypeObject} from "./types/responsesTypeObject";
import {ResponsesDiffObjectType} from "./types/responses-diff-object.type";

export class PathsDiffer {
  operationsKeys: string[] = [
    'post',
    'get',
    'patch',
    'delete',
    'put',
  ]
  source: PathsObject;
  destination: PathsObject;

  pathsDiff: PathsDiffType;

  public hasDeleted: boolean = false;
  public hasCreated: boolean = false;
  public hasUpdate: boolean = false;

  private readonly created: Set<string> = new Set<string>([]);

  constructor(source: PathsObject, destination: PathsObject) {
    this.source = source;
    this.destination = destination;

    this.pathsDiff = this.diff(source, destination);
  }

  diff(oldPaths: PathsObject, newPaths: PathsObject): PathsDiffType {
    const paths_addresses: string[] = [...new Set<string>([
      ...Object.keys(oldPaths),
      ...Object.keys(newPaths)
    ])];
    const paths: PathsDiffType = {};

    for (const path_address of paths_addresses) {
      if(!this.created.has(path_address)) {
        let source: PathItemObject = oldPaths[path_address];
        let destination: PathItemObject = newPaths[path_address];
        let currentAddress: string = path_address;

        if(!destination) {
          const removeParams: string = path_address.replace(/{([A-z]*)}/gm, '');
          if(removeParams !== path_address) {
            const correctName: string|undefined = paths_addresses.find((address: string) =>
              address.replace(/{([A-z]*)}/gm, '') === removeParams &&
              address !== path_address
            );
            if(correctName) {
              destination = newPaths[correctName];
              currentAddress = correctName;
              this.created.add(correctName);
            }
          }
        }

        if(source) {
          const replaceParam: string = path_address.replace(/{([A-z]*)}/gm, '');
          if(replaceParam !== path_address) {
            const correctName: string|undefined = paths_addresses.find((address: string) =>
              address.replace(/{([A-z]*)}/gm, '') === replaceParam &&
              address !== path_address
            );
            if(correctName) {
              source = newPaths[correctName];
              this.created.add(correctName);
            }
          }
        }

        if (source && destination) {//update or no changes
          paths[currentAddress] = this.pathItemUpdate(source, destination);
        } else if (source && !destination) {//delete
          paths[currentAddress] = this.pathItemDeleteOrCreate(source, ChangeTypeEnum.deleted);
        } else if (!source && destination) {//create
          paths[currentAddress] = this.pathItemDeleteOrCreate(destination, ChangeTypeEnum.created);
        }

        this.created.add(path_address);
      }
    }
    return paths;
  }

  pathItemUpdate(oldPath: PathItemObject, newPath: PathItemObject): OperationsChanges {
    const operationsNames: string[] = [...new Set<string>([
      ...(oldPath ? Object.keys(oldPath) : []),
      ...Object.keys(newPath)
    ])].filter((v: string) => this.operationsKeys.includes(v));
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

      if (!this.hasUpdate && isUpdated) {
        this.hasUpdate = true;
      }

      operations[operation] = {
        changeType: isUpdated ? ChangeTypeEnum.updated : ChangeTypeEnum.default,
        pathParameters,
        request,
        responses,
        deprecated: newOperation.deprecated,
      }
    }
    return operations;
  }

  pathItemDeleteOrCreate(oldPath: PathItemObject, changeType: ChangeTypeEnum): OperationsChanges {
    const operationsNames: string[] = [...new Set<string>([...(oldPath ? Object.keys(oldPath) : [])])].filter((v: string) => this.operationsKeys.includes(v));
    const operations: OperationsChanges = {};

    switch (changeType) {
      case ChangeTypeEnum.deleted: {
        this.hasDeleted = true;
        break;
      }
      case ChangeTypeEnum.created: {
        this.hasCreated = true;
        break;
      }
    }

    for (const operation of operationsNames) {
      const oldOperation: Operation = OperationsConverter.convertingToNormal(oldPath[operation as keyof PathItemObject] as OperationObject);

      const pathParameters: PathParameterDiff[] = this.parametersDiff(oldOperation?.pathParameters, []);

      const request: SchemaPropertyDiff = this.requestDiff(oldOperation.request, []);

      const { responses, hasChanges } = this.responseDiff(oldOperation.response);

      operations[operation] = {
        changeType: hasChanges ? ChangeTypeEnum.updated : changeType,
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
        params.push(this.parameterCreateOrDelete(old, ChangeTypeEnum.deleted));
      } else if (!old && new_) {//created
        params.push(this.parameterCreateOrDelete(new_, ChangeTypeEnum.created));
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
      changeType: ChangeTypeEnum.default,
    };

    const type: string = oldParameter.enum ? 'enum' : oldParameter.type!;

    if (type === 'enum' && oldParameter.enum && newParameter.enum) { //if type is enum
      const diffEnum: EnumDiffType = SchemasDiffer.diffForEnum(oldParameter.enum, newParameter.enum);
      return {
        ...schemaDiff,
        changeType: diffEnum.added.length > 0 || diffEnum.deleted.length > 0 ? ChangeTypeEnum.updated : ChangeTypeEnum.default,
        ...diffEnum,
      }
    }

    if (type === 'object' && oldParameter.property && newParameter.property) {
      const schemaPropertyDiff: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldParameter.property, newParameter.property ?? []);

      return {
        ...schemaDiff,
        changeType: schemaPropertyDiff.added.length > 0 || schemaPropertyDiff.deleted.length > 0 ? ChangeTypeEnum.updated : ChangeTypeEnum.default,
        ...schemaPropertyDiff,
      }
    }

    return schemaDiff;
  }

  parameterCreateOrDelete(parameter: PathParameter, changeType: ChangeTypeEnum): PathParameterDiff {
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

    if(!oldReq && !newReq) {
      return {
        added: [],
        deleted: [],
      };
    }

    if(oldReq?.$ref || newReq?.$ref) {
      const equals: boolean = oldReq?.$ref === newReq?.$ref;

      return {
        added: equals ? [] : (newReq?.$ref  && newRequest.length > 0 ? [] : []),
        deleted: equals ? [] :  (oldReq?.$ref  && newRequest.length > 0 ? [oldReq.$ref] : []),
        $ref: oldReq.$ref ?? newReq?.$ref,
      }
    }

    const schemaPropertyDiff: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldReq?.property ?? [], newReq?.property ?? []);

    return {
      ...schemaPropertyDiff,
      ...(oldReq?.$ref && (oldReq.$ref !== newReq?.$ref) && { deleted: [oldReq.$ref, ...schemaPropertyDiff.deleted] }),
      ...(newReq?.$ref && (newReq.$ref !== oldReq?.$ref) && { added: [newReq.$ref, ...schemaPropertyDiff.added] }),
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

      const changeType: ChangeTypeEnum = createdKeys.includes(key)
        ? ChangeTypeEnum.created
        : (
          deletedKeys.includes(key)
            ? ChangeTypeEnum.deleted
            : (diff.added.length > 0 || diff.deleted.length > 0 && Boolean(newResponses) ? ChangeTypeEnum.updated : ChangeTypeEnum.default)
        )

      if(hasChanges && changeType !== ChangeTypeEnum.default) {
        hasChanges = true;
      }

      responses[key] = {
        changeType: changeType,
        ...(newResponse && newResponse.length > 0 && newResponse[0].type !== 'object' && { type: newResponse[0].type }),
        ...(oldResponse && !newResponses && { type: oldResponse[0].type }),
        ...diff,
      }
    }

    return { responses, hasChanges };
  }
}