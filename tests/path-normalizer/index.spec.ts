import { PathsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { pathNormalizer } from '../../src/helpers/path-normalizer';
import { Path } from '../../src/normalizer-types/normalized-path';
import data from './data/normalize-import.json';

describe('path-normalizer', () => {
  it('shod path normalize', () => {
    const normalized: Path = pathNormalizer(data.input as PathsObject);
    expect(normalized).toEqual(data.output);
  });
});
