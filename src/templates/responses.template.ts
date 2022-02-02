export function ResponsesTemplate(html: string): string {
    return `
<div class="responses-wrapper">
    <div class="opblock-section-header"><h4>Responses</h4></div>
    <div class="responses-inner">
        ${html}
    </div>
</div>    
`
}