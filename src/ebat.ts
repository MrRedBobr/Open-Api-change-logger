import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";
import {ChangeLogger} from "./change-logger";

import adminSource from './../example-apis/admin-prod.json';
import dist from './../example-apis/admin-dev.json';
import fs from "fs";

const source: OpenAPIObject = adminSource as OpenAPIObject;
const destination: OpenAPIObject = dist as OpenAPIObject;

const changeLog: ChangeLogger = new ChangeLogger(source, destination);

const currentVersion: string = changeLog.currentVersion; //7.5.1

changeLog.getJson() //return object with difference

fs.writeFileSync('file.json', JSON.stringify(changeLog.getJson(), null, ' '));

changeLog.renderAndSave({
  path: './',
  fileName: `apiName.${currentVersion}`,
  format: 'html', //isOptional
});

