// import {ChangeLog} from "./change-log";
//
// export * from './open-api-diff';
// export * from './converter';
// export * from './change-log';
//
import adminSource from '../example-apis/prod.json';
import dist from '../example-apis/dev.json';
import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";
import {PathsDiff} from "./paths-diff";
import {SchemasDiffer} from "./schemas-differ";
import * as fs from "fs";

const source: OpenAPIObject = adminSource as any;
const destination: OpenAPIObject = dist as any;

const schemasDiff = new SchemasDiffer(source.components!.schemas!, destination.components!.schemas!);
const pathsDiff = new PathsDiff(source.paths, destination.paths);

fs.writeFileSync('file.json', JSON.stringify({
  paths: pathsDiff.pathsDiff,
  schemas: schemasDiff.schemasDifference,
}, null, '  '));