import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";
import {ChangeLogger} from "./change-logger";

export * from './types';
export * from './change-logger';

import adminSource from './../example-apis/admin.prod.json';
import adminDestination from './../example-apis/admin.dev.json';
import fs from "fs";


const source: OpenAPIObject = adminSource as OpenAPIObject;
const destination: OpenAPIObject = adminDestination as OpenAPIObject;

const changeLog: ChangeLogger = new ChangeLogger(source, destination);

const currentVersion: string = changeLog.currentVersion; //7.5.1

changeLog.getJson() //return object with difference

fs.writeFileSync('./example-apis/admin-diff.json', JSON.stringify(changeLog.getJson(),null, '  '));

changeLog.renderAndSave({
    path: './example-apis',
    fileName: `apiName`,
    format: 'html', //isOptional
    pasteVersionInName: true, // isOptional
});