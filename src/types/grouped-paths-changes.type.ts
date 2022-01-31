import {Path} from './path.type';

export type GroupedPathsChangesType = {
  created: Path[];
  updated: Path[];
  deleted: Path[];
};
