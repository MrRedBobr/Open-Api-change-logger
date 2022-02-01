export function stylesTemplate() {
  return `
<link href="normalize.css" type="text/css" rel="stylesheet">
<link href="ui.css" type="text/css" rel="stylesheet">
<style>
  html
  {
    box-sizing: border-box;
    overflow: -moz-scrollbars-vertical;
    overflow-y: scroll;
  }

  *,
  *:before,
  *:after
  {
    box-sizing: inherit;
  }

  body
  {
    margin:0;
    background: #fafafa;
  }

</style>`
}