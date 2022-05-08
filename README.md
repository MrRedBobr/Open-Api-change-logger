### OpenApi change-logger
```typescript
const source: OpenAPIObject = adminSource;
const destination: OpenAPIObject = dist;

const changeLog: ChangeLogger = new ChangeLogger({
    oldSchema: oldCustomer,
    newSchema: newCustomer
});

const currentVersion: string = changeLog.currentVersion; //7.5.1

changeLog.getJson() //Returns you a json, comparing the two schemes.

changeLog.renderAndSave({
    path: './',
    fileName: `apiName`,
    format: 'html', //isOptional
    pasteVersionInName: true, // isOptional
});
```
