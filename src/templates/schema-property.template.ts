import {SchemaPropertyType} from "../types";
import {ChangesWhenNeedUseColor} from "../const/changes-when-need-use-color.const";
import {ChangeType} from "../types/change.type";
import {ChangeColor} from "../helpers/change-color";

const useDefRef: ChangeType[] = ['CREATE', 'DEFAULT']

export function SchemaPropertyTemplate(prop: SchemaPropertyType, endpointChangeType: ChangeType, added: string[], deleted: string[]): string {
    const useColor: boolean = endpointChangeType === 'CREATE' || endpointChangeType === 'DELETE' || ChangesWhenNeedUseColor.includes(endpointChangeType);

    const isCreate: boolean = added.includes(prop.name) || endpointChangeType === 'CREATE';
    const isDelete: boolean = deleted.includes(prop.name) || endpointChangeType === 'DELETE';

    const changeColor: string = ChangeColor( isCreate ? 'CREATE' : isDelete ? 'DELETE' : 'DEFAULT');

    const deleteRefHtml: string = deleted.length === 1 ? `<span class="prop-type" style="background-color: rgba(255,0,0,0.55)">${deleted[0]}</span>` : '';
    const createRefHtml: string = deleted.length === 1 ? `<span class="prop-type" style="background-color: rgba(0,255,0,0.55)">${deleted[0]}</span>` : '';
    const defaultRef: string = useDefRef.includes(endpointChangeType) && prop.type === 'ref' ? `<span class="prop-type">${prop.$ref}</span>` : '';

    return `
<tr class="property-row ${prop.required ? 'required':''}" ${useColor ? `style="background-color: ${changeColor}` : ''}">
    <td>${prop.name} ${prop.required ? `<span class="star">*</span>` : ''}</td>
    <td>
        <span class="model">
            <span class="prop">
                ${prop.type === 'ref' ?
                    deleteRefHtml+createRefHtml+defaultRef : `
                        <span class="prop-type">${prop.type === 'ref[]' ? `${prop.$ref}[]` : prop.type}</span>
                            ${prop.enum ? `
                                <span class="prop-enum">
                                      ${prop.enum}
                                </span>
                            ` : ''}
                    
                    `
                }
            </span>
        </span>
    </td>
</tr>
`
}