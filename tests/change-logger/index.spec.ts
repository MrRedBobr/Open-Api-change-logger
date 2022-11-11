import { ChangeLogger } from '../../src/change-logger';
import { ChangeLoggerInput } from '../../src/inputs/change-logger.input';
import newSchema from './data/new-schema.json';
import oldSchema from './data/old-schema.json';

describe('change logger', () => {
  const input: ChangeLoggerInput = {
    oldSchema: oldSchema as any,
    newSchema: newSchema as any,
  };
  let changeLogger: ChangeLogger;

  it('should create change logger', function () {
    changeLogger = new ChangeLogger(input);

    expect(changeLogger).toBeDefined();
  });

  it('should find changes', function () {
    expect(changeLogger.schemasHasChanges).toBeTruthy();
  });

  it('should find changes', function () {
    changeLogger.render();
  });
});
