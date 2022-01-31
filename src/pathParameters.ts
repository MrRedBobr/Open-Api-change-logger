import {ParameterObject, ReferenceObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {pathParameter} from "./types/parameter.type";
import {SchemaConverter} from "./schema-converter";

export class PathParameters {
  private static param({ schema, name, in: placed, required, deprecated }: ParameterObject): pathParameter | undefined {
    if(!schema) {
      return undefined;
    }

    const prop: pathParameter = {
      placed,
      name,
      ...SchemaConverter.property(schema),
      required: !!required,
      deprecated: deprecated ?? false,
    };

    return prop;
  }

  public static parameters(parameters?: (ParameterObject | ReferenceObject)[]): pathParameter[] {
    const headerParams: (ParameterObject)[] = parameters?.filter((param: ParameterObject | ReferenceObject) => {
      if('in' in param) {
        return param.in === "header";
      }
      return false;
    }) as ParameterObject[] ?? [];

    const pathParams: (ParameterObject)[] = parameters?.filter((param: ParameterObject | ReferenceObject) => {
      if('in' in param) {
        return param.in === "path";
      }
      return false;
    }) as ParameterObject[] ?? [];

    const queryParams: (ParameterObject)[] = parameters?.filter((param: ParameterObject | ReferenceObject) => {
      if('in' in param) {
        return param.in === "query";
      }
      return false;
    }) as ParameterObject[] ?? [];

    const cookieParams: (ParameterObject)[] = parameters?.filter((param: ParameterObject | ReferenceObject) => {
      if('in' in param) {
        return param.in === "cookie";
      }
      return false;
    }) as ParameterObject[] ?? [];

    return [
      ...headerParams.map(this.param).filter(Boolean) as pathParameter[],
      ...pathParams.map(this.param).filter(Boolean) as pathParameter[],
      ...queryParams.map(this.param).filter(Boolean) as pathParameter[],
      ...cookieParams.map(this.param).filter(Boolean) as pathParameter[],
    ]
  }
}