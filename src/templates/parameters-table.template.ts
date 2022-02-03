export function ParametersTableTemplate(elementsHtml: string[]) {
  return `
      <div class="table-container">
        <table class="parameters">
          <thead>
            <tr>
              <th class="col_header parameters-col_name">Name</th>
              <th class="col_header parameters-col_description">Description</th>
            </tr>
          </thead>
          <tbody>
          ${elementsHtml.join('\n')}
          </tbody>
        </table>
      </div>
      `
}