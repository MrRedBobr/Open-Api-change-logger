import {PathType} from "./path-type.type";
import {ParameterObject, RequestBodyObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {ChangeType} from "./change-type.type";

export type FindPathChangesType = {
    name: string;
    pathType: PathType;
    parameterObjects: ParameterObject[];
    pathDiffs: ParameterObject[];
    requestBody?: RequestBodyObject;
    changeType: ChangeType;
}