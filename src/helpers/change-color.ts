import {ChangeType} from "../types/change.type";

export function ChangeColor(changeType: ChangeType): string {
  switch (changeType) {
    case "CREATE": {
      return 'rgb(166,255,147)';
    }
    case "DEFAULT": {
      return 'transparent';
    }
    case "DELETE": {
      return 'rgba(255,127,127,0.55)';
    }
    case "UPDATE": {
      return 'rgb(166,255,147)'
    }
  }
}