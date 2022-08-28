import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { AllOf, AnyOf, EnumSchema, notOf, OneOf, RefSchema, StringSchema } from '../interfaces/schemas';
import { NormalizedSchema, SchemaType } from '../types/normalized-schema';

export function SchemaNormalizer(schema: Record<string, SchemaObject | ReferenceObject>, requiredFields: string[] = []): NormalizedSchema {
  const fields: string[] = Object.keys(schema);
  const requiredFieldsSet: Set<string> = new Set<string>(requiredFields);
  const normalizedSchema: NormalizedSchema = {};

  for (const field of fields) {
    const obj: SchemaObject | ReferenceObject = schema[field];
    const required: boolean = requiredFieldsSet.has(field);
    normalizedSchema[field] = {
      ...normalizeObject(obj),
      required,
    };
  }

  return normalizedSchema;
}
//todo fix eslint disable
// eslint-disable-next-line complexity
export function normalizeObject(obj: SchemaObject | ReferenceObject): SchemaType {
  if ('$ref' in obj) {
    const [name]: string[] = obj.$ref.split('/').reverse();

    obj.$ref;
    return {
      type: 'ref',
      name,
      isArray: false,
    };
  } else {
    switch (obj.type) {
      case 'array': {
        return {
          ...normalizeObject(obj.items!),
          isArray: true,
        };
      }
      case 'object': {
        return {
          type: 'object',
          object: obj.properties ? SchemaNormalizer(obj.properties, obj.required) : {},
          isArray: false,
        };
      }
      case 'string': {
        return normalizeString(obj);
      }
    }
  }
  if (obj.oneOf || obj.not || obj.anyOf || obj.allOf) {
    return normalizeOfObject(obj);
  }

  return {
    type: obj.type as any,
    ...(obj.example && { example: obj.example }),
    isArray: false,
  };
}

function normalizeString(obj: SchemaObject): StringSchema | EnumSchema {
  return obj.enum
    ? {
        type: 'enum',
        values: obj.enum as any[],
        isArray: false,
        ...(obj.example && { example: obj.example }),
      }
    : {
        type: 'string',
        isArray: false,
        ...(obj.example && { example: obj.example }),
      };
}

function normalizeOfObject(obj: SchemaObject): OneOf | AllOf | AnyOf | notOf {
  if (obj.oneOf) {
    return {
      oneOf: obj.oneOf.map((obj: SchemaObject | ReferenceObject) => normalizeObject(obj) as RefSchema),
    };
  }

  if (obj.anyOf) {
    return {
      anyOf: obj.anyOf.map((obj: SchemaObject | ReferenceObject) => normalizeObject(obj) as RefSchema),
    };
  }

  if (obj.allOf) {
    return {
      allOf: obj.allOf.map((obj: SchemaObject | ReferenceObject) => normalizeObject(obj) as RefSchema),
    };
  }

  return {
    not: normalizeObject(obj.not!) as RefSchema,
  };
}
