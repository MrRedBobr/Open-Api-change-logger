import {OpenAPIObject} from "@nestjs/swagger/dist/interfaces";

export interface ChangeLoggerSchemasInput {
    /**
     * new api version schema
     */
    newSchema: OpenAPIObject,

    /**
     * old api version schema
     */
    oldSchema: OpenAPIObject,
}