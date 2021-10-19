import { Properties } from './properties.type';
import { Property } from './property.type';
import {EnumProperty} from "./enum-property.type";

export type Schema = {
  changeType: string;
  name: string;
  type: string;
  properties?: Properties;
  enum?: EnumProperty[];
};
