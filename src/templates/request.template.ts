export function RequestTemplate(html: string): string {
    return `
<div class="opblock-section opblock-section-request-body">
    <div class="opblock-section-header">
        <h4 class="opblock-title parameter__name">Request body</h4>
    </div>
    <div class="opblock-description-wrapper" style="padding: 16px">
        <div class="model-box">
            ${html}
        </div>
    </div>
</div>  
`
}