import {ChangeTypeEnum} from "../types";
import {ChangeColor} from "../helpers/change-color";

export function ResponseTableTemplate(code: string, changeType: ChangeTypeEnum, html: string): string {
  const green: string = ChangeColor(changeType);

  return `
    <table class="responses-table">
        <thead>
            <tr class="responses-header">
                <th class="col_header response-col_status">Code</th>
                <th class="col_header response-col_description">Description</th>
            </tr>
        </thead>
        <tbody>
            <tr class="response" data-code="${code}" style="background-color: ${green}">
                <td>${code}</td>
                <td>${html}</td>
            </tr>
        </tbody>
    </table>
`
}