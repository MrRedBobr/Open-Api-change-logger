### OpenApi change-logger
```typescript
import { ChangeLogger } from "open-api-change-logger";
import source from "./source.json";
import destination from "./destination.json";
import { OpenAPIObject } from "@nestjs/swagger/dist/interfaces";
import * as path from "path";

const changeLogger: ChangeLogger = new ChangeLogger({
  oldSchema: source as OpenAPIObject,
  newSchema: destination as OpenAPIObject,
});

changeLogger.saveFiles({
  htmlFolder: path.join(__dirname, 'files', 'html'),
  stylesFolder: path.join(__dirname, 'files', 'style'),
  apiName: 'test-api'
});
```
