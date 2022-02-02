export function ParametersTemplate(html: string): string {
    return `
<div class="opblock-body">
    <div class="opblock-section">
        <div class="opblock-section-header">
          <div class="tab-header">
            <div class="tab-item active">
                <h4 class="opblock-title"><span>Parameters</span></h4>
            </div>
          </div>
        </div>
        <div class="parameters-container">
            ${html}
        </div>
    </div>
    <div class="execute-wrapper"></div>
    <div class="responses-wrapper"></div>
</div>
`
}