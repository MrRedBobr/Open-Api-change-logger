import { ChangeLogger } from "../src";
import source from "./source.json";
import destination from "./destination.json";
import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";
import fs from "fs";
import * as path from "path";

const changeLogger: ChangeLogger = new ChangeLogger({
  oldSchema: source as OpenAPIObject,
  newSchema: destination as OpenAPIObject,
});

fs.writeFileSync(path.join(__dirname, 'diff.json'), JSON.stringify(changeLogger.getJson(), null, '  '));