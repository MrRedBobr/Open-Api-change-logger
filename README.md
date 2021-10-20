### OpenApi change-logger
```typescript
const changeLoger: ChangeLog = new ChangeLog(source: OpenAPIObject, destination: OpenAPIObject, {
	apiName: string;
	hbsTemplate?: string;
	[key:string]: any
})

fs.writeFileSync('pathFile/name.html', changeLoger.render());
```

------------

*If, In Addition To Generating Html, You Also Want To Get A Version That Depends On Changes:*

```typescript
changeLog._openApiDiff.version
// return new version.
//Current version gets from source.json
```
