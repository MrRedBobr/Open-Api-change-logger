import { SchemaType } from '../normalizer-types/normalized-schema';
import { ChangeType } from './change-type';

export type SchemasDiff = {
  changeType: ChangeType;
  propertyName: string;
  previousSchema?: SchemaType;
  currentSchema: SchemaType;
};
