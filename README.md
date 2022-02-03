### OpenApi change-logger
```typescript
const source: OpenAPIObject = adminSource;
const destination: OpenAPIObject = dist;

const changeLog: ChangeLogger = new ChangeLogger(source, destination);

const currentVersion: string = changeLog.currentVersion; //7.5.1

changeLog.getJson() //return object with difference

changeLog.renderAndSave({
  path: './',
  fileName: `apiName.${currentVersion}`,
  format: 'html', //isOptional
});
```
