import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { EnumSchema, StringSchema } from '../interfaces/schemas';
import { SchemaType } from '../types/normalized-schema';

export function getDefaultNormalizeType(obj: SchemaObject): SchemaType {
  return {
    type: obj.type as any,
    ...(obj.title && { title: obj.title }),
    ...(obj.example && { example: obj.example }),
    isArray: false,
  };
}

export function getNormalizeString(obj: SchemaObject): StringSchema | EnumSchema {
  return obj.enum
    ? {
        type: 'enum',
        values: obj.enum as any[],
        isArray: false,
        ...(obj.title && { title: obj.title }),
        ...(obj.example && { example: obj.example }),
      }
    : {
        type: 'string',
        isArray: false,
        ...(obj.title && { title: obj.title }),
        ...(obj.example && { example: obj.example }),
      };
}
