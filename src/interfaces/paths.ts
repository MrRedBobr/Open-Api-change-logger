import { NormalizedSchema, SchemaType } from '../normalizer-types/normalized-schema';

export interface PathOperations {
  get?: NormalizedOperationObject;
  put?: NormalizedOperationObject;
  post?: NormalizedOperationObject;
  delete?: NormalizedOperationObject;
  patch?: NormalizedOperationObject;
}

export interface NormalizedOperationObject {
  headers?: NormalizedSchema;
  path?: NormalizedSchema;
  query?: NormalizedSchema;
  cookie?: NormalizedSchema;
  summary: string;
  security: string;
  description: string;
  responses: Record<string, SchemaType>;
  requestBody?: SchemaType;
}
