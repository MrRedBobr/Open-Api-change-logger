import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { AllOf, AnyOf, notOf, ObjectSchema, OneOf, RefSchema } from '../interfaces/schemas';
import { NormalizedSchema, SchemaType } from '../types/normalized-schema';
import { RefSchemaName } from './ref-schema-name';
import { getDefaultNormalizeType, getNormalizeString } from './types-normalizer';

export function SchemaNormalizer(schema: Record<string, SchemaObject | ReferenceObject>, requiredFields: string[] = []): NormalizedSchema {
  const fields: string[] = Object.keys(schema);
  const requiredFieldsSet: Set<string> = new Set<string>(requiredFields);
  const normalizedSchema: NormalizedSchema = {};

  for (const field of fields) {
    const obj: SchemaObject | ReferenceObject = schema[field];
    const required: boolean = requiredFieldsSet.has(field);
    normalizedSchema[field] = {
      ...normalizeByType(obj),
      required,
    };
  }

  return normalizedSchema;
}
//todo fix eslint disable
// eslint-disable-next-line complexity
export function normalizeByType(obj: SchemaObject | ReferenceObject): SchemaType {
  return '$ref' in obj ? normalizeRef(obj) : normalizeSchemaObject(obj);
}

export function normalizeRef(ref: ReferenceObject): RefSchema {
  const name: string = RefSchemaName(ref.$ref);

  return {
    type: 'ref',
    name,
    isArray: false,
  };
}

function normalizeSchemaObject(obj: SchemaObject): SchemaType {
  correctTypeBeforeNormalize(obj);

  return normalizeSimpleTypes(obj);
}

function normalizeSimpleTypes(obj: SchemaObject): SchemaType {
  switch (obj.type) {
    case 'array': {
      return arrayNormalize(obj);
    }
    case 'object': {
      return normalizeObjectType(obj);
    }
    case 'string': {
      return getNormalizeString(obj);
    }
  }

  if (obj.oneOf || obj.not || obj.anyOf || obj.allOf) {
    return normalizeOfObject(obj);
  }

  return getDefaultNormalizeType(obj);
}

/**
 * @description object can don't have type property, but have properties.
 * */
function correctTypeBeforeNormalize(obj: SchemaObject): void {
  if (!obj.type && obj.properties) {
    obj.type = 'object';
  }
}

function arrayNormalize(obj: SchemaObject): SchemaType {
  if (!obj.items) throw new Error('Wrong array type');

  return {
    ...normalizeByType(obj.items!),
    ...(obj.title && { title: obj.title }),
    isArray: true,
  };
}

export function normalizeObjectType(obj: SchemaObject): ObjectSchema {
  return {
    type: 'object',
    ...(obj.title && { title: obj.title }),
    object: obj.properties ? SchemaNormalizer(obj.properties, obj.required) : {},
    isArray: false,
  };
}

function normalizeOfObject(obj: SchemaObject): OneOf | AllOf | AnyOf | notOf {
  if (obj.oneOf) {
    return {
      ...(obj.title && { title: obj.title }),
      oneOf: obj.oneOf.map((obj: SchemaObject | ReferenceObject) => normalizeByType(obj) as RefSchema),
    };
  }

  if (obj.anyOf) {
    return {
      ...(obj.title && { title: obj.title }),
      anyOf: obj.anyOf.map((obj: SchemaObject | ReferenceObject) => normalizeByType(obj) as RefSchema),
    };
  }

  if (obj.allOf) {
    return {
      ...(obj.title && { title: obj.title }),
      allOf: obj.allOf.map((obj: SchemaObject | ReferenceObject) => normalizeByType(obj) as RefSchema),
    };
  }

  return {
    ...(obj.title && { title: obj.title }),
    ...(obj.not && { not: normalizeByType(obj.not) as RefSchema }),
  };
}
