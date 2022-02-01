import {
  ContentObject, MediaTypeObject,
  OperationObject,
  ReferenceObject,
  RequestBodyObject, ResponseObject, ResponsesObject, SchemaObject
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {PathParametersDiff} from "./pathParametersDiff";
import {Operation, PathParameter, Schema} from "./types";
import {SchemaConverter} from "./schema-converter";
import {ResponsesTypeObject} from "./types/responsesTypeObject";

export class OperationsConverter {
  public static convertingToNormal(operation?: OperationObject): Operation {

    const pathParameters: PathParameter[] = PathParametersDiff.parameters(operation?.parameters);
    const request: Schema[] = OperationsConverter.request(operation?.requestBody);
    const response: ResponsesTypeObject = OperationsConverter.response(operation?.responses);

    return {
      pathParameters,
      request,
      response,
      deprecated: operation?.deprecated ?? false,
    }
  }

  public static request(req?:  RequestBodyObject | ReferenceObject): Schema[] {
    if(!req) return [];
    if('$ref' in req) return [];

    const { required, content } = req;
    const contentKeys: string[]= Object.keys(content);
    const contents: Schema[] = [];

    for(const key of contentKeys) {
      const schema:  ReferenceObject | SchemaObject | undefined = content[key].schema;
      if(schema) {
        const prop = SchemaConverter.property(schema);
        contents.push({
          required: required ?? false,
          ...prop,
        })
      }
    }
    return contents;
  }

  public static response(responses?:ResponsesObject): ResponsesTypeObject {
    if(!responses) return {};

    const responseCode: string[] = Object.keys(responses);
    const response: ResponsesTypeObject = {};

    for (const code of responseCode) {
      const resp: ResponseObject | ReferenceObject | undefined = responses[code];
      if (!resp || '$ref' in resp || !resp.content) {}
      else {
        const respContent: ContentObject = resp.content;

        const contentTypes: string[] = Object.keys(respContent);
        const property: Schema[] = [];

        for(const contentType of contentTypes) {
          const content: MediaTypeObject = respContent[contentType];
          const schema:  ReferenceObject | SchemaObject | undefined = content.schema;

          if (schema) {
            property.push(SchemaConverter.property(schema));
          }
        }
        response[code] = property;
      }
    }
    return response;
  }

  public static diffOperations(oldOperation: Operation, newOperation: Operation): void {

  }
}