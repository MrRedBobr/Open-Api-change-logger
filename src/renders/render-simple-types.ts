import { BooleanSchema, EnumSchema, NumberSchema, RefSchema, StringSchema } from '../interfaces/schemas';

export function RenderSimpleTypes(type: NumberSchema | StringSchema | BooleanSchema): string {
  return `
<div class="prop-value simple">
  ${type.example ? `<span class="example">${type.example}</span>` : ''}
  <span class="type">${RenderName(type.isArray, type.type)}</span>
</div>
  `;
}

export function RenderEnum(type: EnumSchema): string {
  return `
<div class="prop-value enum">
  ${type.example ? `<span class="example">${type.example}</span>` : ''}
  <span class="type">${RenderName(type.isArray, type.type)}</span>
  <span class="enum-values">${type.values.join(', ')}</span>
</div>
  `;
}

export function RenderRef(type: RefSchema): string {
  return `
<div class="prop-value ref">
  ${type.example ? `<span class="example">${type.example}</span>` : ''}
  <span class="type ref">${RenderName(type.isArray, type.type)}</span>
</div>
  `;
}

function RenderName(isArray: boolean, name: string): string {
  return isArray ? `[${name}]` : name;
}

export function renderOfProp(refs: RefSchema[], type: 'oneOf' | 'allOf' | 'anyOf' | 'not'): string {
  const renderedSchemas: string[] = [];
  for (const ref of refs) {
    renderedSchemas.push(RenderRef(ref));
  }

  return `
<div class="type-of ${type}">
  ${renderedSchemas.join('\n')}
</div>
  `;
}
