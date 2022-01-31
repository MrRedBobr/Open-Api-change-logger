import {
  ContentObject,
  MediaTypeObject,
  OperationObject,
  PathItemObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {pathParameter} from "./types/parameter.type";
import {PathParameters} from "./pathParameters";
import {Schema} from "./types/schema.type";
import {Operation} from "./types/Operation.type";
import {SchemaConverter} from "./schema-converter";

export class PathDiff {
  private readonly operationObject: OperationObject;
  private readonly operationType: string;
  public operation: Operation;



  constructor(operationObject: OperationObject, operationType: string) {
    this.operationObject = operationObject;
    this.operationType = operationType;
    this.operation = this.convertingToNormal();
  }

  convertingToNormal(): Operation {
    const point = this.operationObject;

    const pathParameters: pathParameter[] = PathParameters.parameters(point?.parameters);
    const request: any[] = this.request(point?.requestBody);
    const response: any [] = this.response(point?.responses);

    return {
      operationType: this.operationType,
      pathParameters,
      request,
      response,
    }
  }

  request(req?:  RequestBodyObject | ReferenceObject): Schema[] {
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

  response(responses?:ResponsesObject): Schema[] {
    if(!responses) return [];

    const responseCode: string[] = Object.keys(responses);
    const response: any[] = [];

    for (const code of responseCode) {
      const resp: ResponseObject | ReferenceObject | undefined = responses[code];
      if (!resp || '$ref' in resp || !resp.content) {}
      else {
        const respContent: ContentObject = resp.content;

        const contentTypes: string[] = Object.keys(respContent);
        const properties: any[] = [];

        for(const contentType of contentTypes) {
          const content: MediaTypeObject = respContent[contentType];
          const schema:  ReferenceObject | SchemaObject | undefined = content.schema;

          if (schema) {
            properties.push(SchemaConverter.property(schema));
          }
        }
        response.push({ code, properties });
      }
    }
    return response;
  }
}