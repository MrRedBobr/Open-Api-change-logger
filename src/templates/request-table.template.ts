export function RequestTableTemplate(propertyHtml: string[]): string {
  return `
<table class="model">
    <tbody>
        ${propertyHtml.join('\n')}
    </tbody>
</table>
`
}