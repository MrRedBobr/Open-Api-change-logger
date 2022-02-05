import {ParameterObject, ReferenceObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {SchemaConverter} from "./schema-converter";
import {PathParameter} from "./types";

export class PathParametersConverter {
  private static param({ schema, name, in: placed, required, deprecated }: ParameterObject): PathParameter | undefined {
    if(!schema) {
      return undefined;
    }

    const prop: PathParameter = {
      placed,
      name,
      ...SchemaConverter.property(schema),
      required: !!required,
      deprecated: deprecated ?? false,
    };

    return prop;
  }

  public static parameters(parameters?: (ParameterObject | ReferenceObject)[]): PathParameter[] {
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
      ...headerParams.map(this.param).filter(Boolean) as PathParameter[],
      ...pathParams.map(this.param).filter(Boolean) as PathParameter[],
      ...queryParams.map(this.param).filter(Boolean) as PathParameter[],
      ...cookieParams.map(this.param).filter(Boolean) as PathParameter[],
    ]
  }
}