import * as fs from 'fs';
import path from 'path';

import { ChangeLogger } from '../../src/change-logger';
import { ChangeLoggerInput } from '../../src/inputs/change-logger.input';
import data1 from './data/data1.json';
import data2 from './data/data2.json';

describe('path-normalizer', () => {
  it('shod path normalize', () => {
    const logger: ChangeLogger = new ChangeLogger({
      oldSchema: data1,
      newSchema: data2,
    } as ChangeLoggerInput);

    fs.writeFileSync(path.join(__dirname, 'fff.html'), logger.render());
  });
});
