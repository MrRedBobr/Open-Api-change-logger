import {OperationObject, PathItemObject, PathsObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {OperationsConverter} from "./operations-diff";
import {
  Operation,
  OperationsChanges,
  PathParameter,
  PathParameterDiff,
  PathsDiffType,
  SchemaPropertyDiff, SchemaPropertyType
} from "./types";
import {ChangeType} from "./types/change.type";
import {EnumDiffType} from "./types/enum-diff.type";
import {SchemasDiffer} from "./schemas-differ";

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

    for (const path_address of paths_addresses.slice(4)) {
      const source: PathItemObject = oldPaths[path_address];
      const destination: PathItemObject = newPaths[path_address];

      if (source && destination) {//update or no changes
        paths[path_address] = this.pathItemUpdate(source, destination);
      } else if (source && !destination) {//delete
        paths[path_address] = this.pathItemDeleteOrCreate(source, 'DELETE');
      } else if (!source && destination) {//create
        paths[path_address] = this.pathItemDeleteOrCreate(source, 'CREATE');
      }
    }
    return paths;
  }

  pathItemUpdate(oldPath: PathItemObject, newPath: PathItemObject): OperationsChanges {
    const operationsNames: string[] = [...new Set<string>([...(oldPath ? Object.keys(oldPath) : []), ...Object.keys(newPath)])].filter((v: string) => this.operationsKeys.includes(v));
    const operations: OperationsChanges = {};

    for (const operation of operationsNames) {
      const oldOperation: Operation = OperationsConverter.convertingToNormal(oldPath[operation as keyof PathItemObject] as OperationObject);
      const newOperation: Operation = OperationsConverter.convertingToNormal(newPath[operation as keyof PathItemObject] as OperationObject);

      const pathParameters: PathParameterDiff[] = this.parametersDiff(oldOperation.pathParameters ?? [], newOperation.pathParameters ?? []);
      const request: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldOperation.request[0]?.property! ?? [], oldOperation.request[0]?.property! ?? []);
      const response: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldOperation.response[0]?.property! ?? [], oldOperation.response[0]?.property! ?? []);

      const isUpdated: boolean =
        (request.added.length > 0 && request.deleted.length > 0)
        || (response.added.length > 0 && response.deleted.length > 0)
        || pathParameters.reduce((previousValue: boolean, currentValue: PathParameterDiff): boolean => (currentValue.added.length > 0 && currentValue.deleted.length > 0), false);

      operations[operation] = {
        changeType: isUpdated ? 'UPDATE' : 'DEFAULT',
        pathParameters,
        request,
        response,
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
      const request: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldOperation.request[0]?.property! ?? [], []);
      const response: SchemaPropertyDiff = SchemasDiffer.diffForProperty(oldOperation.response[0]?.property! ?? [], []);

      operations[operation] = {
        changeType: changeType,
        pathParameters,
        request,
        response,
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
      const diffEnum: EnumDiffType = this.diffForEnum(oldParameter.enum, newParameter.enum);
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
      const diffEnum: EnumDiffType = this.diffForEnum(parameter.enum, []);
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

  diffForEnum(oldSchema: string[], newSchema: string[]): EnumDiffType {
    const values: string[] = [...new Set<string>([...oldSchema, ...newSchema])];
    return {
      added: values.filter((value: string) => !oldSchema.includes(value)),
      deleted: values.filter((value: string) => !newSchema.includes(value)),
      enum: values,
    }
  }
}