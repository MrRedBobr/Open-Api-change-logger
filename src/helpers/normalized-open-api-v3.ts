import { Path } from '../normalizer-types/normalized-path';
import { NormalizedSchema } from '../normalizer-types/normalized-schema';

export type NormalizedOpenApiV3 = {
  security: NormalizedSchema;
  schemas: NormalizedSchema;
  paths: Path;
};
