import {ChangeType} from './change-type.type';
import {PathType} from './path-type.type';
import {Properties} from './properties.type';

export type Path = {
  changeType?: ChangeType;
  name: string;
  pathType: PathType;
  isGet?: boolean;
  isPost?: boolean;
  isPatch?: boolean;
  isDelete?: boolean;
  parameters?: Properties;
};
