import {
  OperationObject,
  PathItemObject,
  PathsObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { NormalizedOperationObject, PathOperations } from '../interfaces/paths';
import { Path } from '../normalizer-types/normalized-path';
import { NormalizedSchema, SchemaType } from '../normalizer-types/normalized-schema';
import { normalizeByType, normalizeRef } from './schema-normalizer';

const operationsTypes: (keyof PathOperations)[] = ['get', 'patch', 'post', 'put', 'delete'];

export function pathNormalizer(pathObject: PathsObject): Path {
  const paths: (keyof PathsObject)[] = Object.keys(pathObject);
  const normalizedPaths: Path = {};

  for (const path of paths) {
    const pathItem: PathItemObject = pathObject[path];
    const operations: PathOperations = {};

    for (const operationType of operationsTypes) {
      const operation: OperationObject | undefined = pathItem[operationType];
      if (operation) {
        operations[operationType] = normalizeOperation(operation);
      }
    }
    normalizedPaths[path] = operations;
  }

  return normalizedPaths;
}

function normalizeOperation(operation: OperationObject): NormalizedOperationObject {
  const security: string = operation.security ? Object.keys(operation.security[0])[0] : '';
  const params: {
    header: NormalizedSchema;
    path: NormalizedSchema;
    query: NormalizedSchema;
    cookie: NormalizedSchema;
  } = {
    header: {},
    path: {},
    query: {},
    cookie: {},
  };

  for (const param of operation.parameters ?? []) {
    if ('$ref' in param) {
      continue;
    }
    if (param.schema) {
      params[param.in][param.name] = {
        ...normalizeByType(param.schema),
        required: param.required,
      };
    }
  }

  const responses: Record<string, SchemaType> = normalizerResponse(operation);
  const requestBody: SchemaType | null = normalizerRequest(operation.requestBody);

  return {
    summary: operation.summary ?? '',
    description: operation.description ?? '',
    security: security,
    ...params,
    responses,
    ...(requestBody && { requestBody }),
  };
}

function normalizerResponse(operation: OperationObject): Record<string, SchemaType> {
  const responses: Record<string, SchemaType> = {};
  for (const responseCode of Object.keys(operation.responses)) {
    const response: ReferenceObject | ResponseObject | undefined = operation.responses[responseCode];
    const normalizedResponse: SchemaType | null = response ? normalizerResponseContent(response) : null;
    if (normalizedResponse) {
      responses[responseCode] = normalizedResponse;
    }
  }
  return responses;
}

function normalizerResponseContent(response: ReferenceObject | ResponseObject): SchemaType | null {
  if ('$ref' in response) {
    return normalizeRef(response);
  }
  if (response.content) {
    const contentType: string = Object.keys(response.content)[0];
    const schema: ReferenceObject | SchemaObject | undefined = response.content[contentType]?.schema;
    if (schema) {
      return {
        ...normalizeByType(schema),
        example: response.content[contentType]?.example,
      };
    }
  }

  return null;
}

function normalizerRequest(body: ReferenceObject | RequestBodyObject | undefined): SchemaType | null {
  if (!body) return null;

  if ('$ref' in body) {
    return normalizeRef(body);
  }
  const dataType: string = Object.keys(body.content)[0];
  const schema: ReferenceObject | SchemaObject | undefined = body.content[dataType]?.schema;

  return schema
    ? {
        ...normalizeByType(schema),
        title: dataType,
        required: body.required,
      }
    : null;
}
