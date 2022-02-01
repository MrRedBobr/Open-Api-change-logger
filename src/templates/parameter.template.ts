import {PathParameterDiff} from "../types";
import {ChangeType} from "../types/change.type";

const changesWhenNeedUseColor: ChangeType[] = ['UPDATE', 'DEFAULT'];

function ChangeColor(changeType: ChangeType): string {
  switch (changeType) {
    case "CREATE": {
      return 'green';
    }
    case "DEFAULT": {
      return 'transparent';
    }
    case "DELETE": {
      return 'rgba(255,0,0,0.55)';
    }
    case "UPDATE": {
      return 'rgba(0,255,0,0.55)'
    }
  }
}

export function ParameterTemplate(v:PathParameterDiff, endpointChangeType: ChangeType) {
  const changeColor: string = ChangeColor(v.changeType);
  const useColor: boolean = changesWhenNeedUseColor.includes(endpointChangeType);

  return `<tr data-param-name="${v.name}" data-param-in="${v.placed}" ${useColor ? `style="background-color: ${changeColor}` : ''}">
          <td class="parameters-col_name" style="position: relative">
            <div class="parameter__name ${v.required && 'required'}">${v.name}${v.required ? '<span>&nbsp;*</span>' : '' }</div>
            <div class="parameter__type">${v.type}</div>
            <div class="parameter__deprecated">${v.deprecated ? 'deprecated' : ''}</div>
            <div class="parameter__in">(${v.placed})</div>
            <div class="parameter__type"></div>
          </td>
          <td class="parameters-col_description">
<!--            todo add description-->
          </td>
        </tr>`;
}