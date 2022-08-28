import { normalizeObject, SchemaNormalizer } from '../../src/helpers/schema-normalizer';
import { NormalizedSchema, SchemaType } from '../../src/types/normalized-schema';
import normalize_object from './data/normalize-object.json';
import normalize_schemas from './data/normalize-schemas.json';

describe('Normalizer test', () => {
  it('should normalize object', () => {
    const schema: SchemaType = normalizeObject(normalize_object.input.CartAddressEntity);
    expect(schema).toEqual(normalize_object.output.CartAddressEntity);
  });
  it('should normalize schemas', () => {
    const schemas: NormalizedSchema = SchemaNormalizer(normalize_schemas.input);
    expect(schemas).toEqual(normalize_schemas.output);
  });
});
