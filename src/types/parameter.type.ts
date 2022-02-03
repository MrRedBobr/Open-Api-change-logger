import {ParameterLocation} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {Schema} from "./schema.type";

export type PathParameter = {
  placed: ParameterLocation,
  required: boolean,
  name: string,
} & Schema