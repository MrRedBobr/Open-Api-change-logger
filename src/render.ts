import { NormalizedOpenApiV3 } from './helpers/normalized-open-api-v3';
import { NumberSchema, ObjectSchema, RefSchema, StringSchema } from './interfaces/schemas';
import { NormalizedSchema, SchemaType } from './normalizer-types/normalized-schema';
import { RenderEnum, renderOfProp, RenderRef, RenderSimpleTypes } from './renders/render-simple-types';

export class Render {
  normalizePrevious: NormalizedOpenApiV3;
  normalizeCurrent: NormalizedOpenApiV3;

  simpleTypes: string[] = ['number', 'string', 'boolean'];

  constructor(normalizePrevious: NormalizedOpenApiV3, normalizeCurrent: NormalizedOpenApiV3) {
    this.normalizePrevious = normalizePrevious;
    this.normalizeCurrent = normalizeCurrent;
  }

  render(): string {
    const schemasNames: Set<string> = new Set<string>([
      ...Object.keys(this.normalizeCurrent.schemas),
      ...Object.keys(this.normalizePrevious.schemas),
    ]);

    const schema: ObjectSchema = this.normalizeCurrent.schemas['CheckoutAddressInput'] as ObjectSchema;

    return this.renderObj(schema.object, 'CheckoutAddressInput');
  }

  renderObj(schema: NormalizedSchema, name: string): string {
    const res: string[] = [];

    for (const field of Object.keys(schema)) {
      const type: SchemaType = schema[field];
      res.push(this.renderProp(type, field));
    }

    return res.join('\n');
  }

  renderProp(type: SchemaType, name: string): string {
    let res: string;

    if ('type' in type) {
      switch (type.type) {
        case 'number':
        case 'string':
        case 'boolean': {
          res = RenderSimpleTypes(type as any);
          break;
        }
        case 'object': {
          res = this.renderObj(type.object, name);
          break;
        }
        case 'enum': {
          res = RenderEnum(type);
          break;
        }
        case 'ref': {
          res = RenderRef(type);
        }
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const fields: ('oneOf' | 'allOf' | 'anyOf' | 'not')[] = Object.keys(type);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ofValues: RefSchema[] = type[fields[0]];
      res = renderOfProp(ofValues, fields[0]);
    }

    return `
<div class="prop">
  <div class="prop-name">${name}</div>${res}
</div>
    `;
  }
}
