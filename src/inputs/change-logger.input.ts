import { OpenAPIObject } from '@nestjs/swagger';

export type ChangeLoggerInput = {
  /**
   * @description new api version schema
   */
  newSchema: OpenAPIObject;

  /**
   * @description old api version schema
   */
  oldSchema: OpenAPIObject;
};
