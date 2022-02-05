import {ChangeTypeEnum} from "../types";

export function ChangeColor(changeType: ChangeTypeEnum): string {
  switch (changeType) {
    case ChangeTypeEnum.created: {
      return 'rgb(166,255,147)';
    }
    case ChangeTypeEnum.default: {
      return 'transparent';
    }
    case ChangeTypeEnum.deleted: {
      return 'rgba(255,127,127,0.55)';
    }
    case ChangeTypeEnum.updated: {
      return 'rgb(166,255,147)'
    }
  }
}