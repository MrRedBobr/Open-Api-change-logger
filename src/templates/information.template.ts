export function InformationTemplate(apiName: string, currentVersion: string): string {
  return `
<div class="information-container wrapper">
    <section class="block col-12">
        <div>
            <div class="info">
                <hgroup class="main">
                    <h2 class="title">
                        ${apiName}              
                        <span>
                            <small><pre class="version">${currentVersion}</pre></small>
                            <small class="version-stamp"><pre class="version">OAS3</pre></small>
                        </span>
                    </h2>
                </hgroup>
            </div>
        </div>
    </section>
</div>  
`
}