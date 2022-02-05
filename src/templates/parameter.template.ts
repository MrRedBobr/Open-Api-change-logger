import {PathParameterDiff} from "../types";
import {ChangeTypeEnum} from "../types";
import {ChangesWhenNeedUseColor} from "../const/changes-when-need-use-color.const";
import {ChangeColor} from "../helpers/change-color";

export function ParameterTemplate(v:PathParameterDiff, endpointChangeType: ChangeTypeEnum) {
  const useColor: boolean = ChangesWhenNeedUseColor.includes(endpointChangeType);

  return `
    <tr data-param-name="${v.name}" data-param-in="${v.placed}" ${useColor ? `style="background-color: ${ChangeColor(v.changeType)}` : ''}">
      <td class="parameters-col_name" style="position: relative">
        <div class="parameter__name ${v.required && 'required'}">${v.name}${v.required ? '<span>&nbsp;*</span>' : '' }</div>
        <div class="parameter__type">${v.type === 'ref' ? v.$ref : v.type}</div>
        <div class="parameter__deprecated">${v.deprecated ? 'deprecated' : ''}</div>
        <div class="parameter__in">(${v.placed})</div>
        ${v.format ? `<div class="parameter__type">${v.format}</div>` : ''}
      </td>
      <td class="parameters-col_description">
  <!--            todo add description-->
      </td>
    </tr>
`;
}