import { OpenAPIObject } from '@nestjs/swagger';

import { NormalizedOpenApiV3 } from './helpers/normalized-open-api-v3';
import { pathNormalizer } from './helpers/path-normalizer';
import { SchemaNormalizer } from './helpers/schema-normalizer';
import { ChangeLoggerInput } from './inputs/change-logger.input';
import { Path } from './normalizer-types/normalized-path';
import { NormalizedSchema } from './normalizer-types/normalized-schema';
import { Render } from './render';

export class ChangeLogger {
  private readonly currentSchema: OpenAPIObject;
  private readonly previousSchema: OpenAPIObject;

  readonly schemasHasChanges: boolean = false;

  constructor({ oldSchema, newSchema }: ChangeLoggerInput) {
    this.currentSchema = newSchema;
    this.previousSchema = oldSchema;
    this.schemasHasChanges = this.hasChanges(this.previousSchema, this.currentSchema);
  }

  private hasChanges(previousValue: any, currentValue: any): boolean {
    return JSON.stringify(previousValue) !== JSON.stringify(currentValue);
  }

  render(): string {
    const normalizePrevious: NormalizedOpenApiV3 = this.normalizeOpenApiV3Schema(this.previousSchema);
    const normalizeCurrent: NormalizedOpenApiV3 = this.normalizeOpenApiV3Schema(this.currentSchema);

    if (!this.hasChanges(normalizePrevious, normalizeCurrent)) {
      console.warn('There is no change in the schema.');
    }

    const render: Render = new Render(normalizePrevious, normalizeCurrent);

    return render.render();
  }

  normalizeOpenApiV3Schema(schema: OpenAPIObject): NormalizedOpenApiV3 {
    const security: NormalizedSchema = schema.components?.securitySchemes ? SchemaNormalizer(schema.components?.securitySchemes) : {};
    const schemas: NormalizedSchema = schema.components?.schemas ? SchemaNormalizer(schema.components?.schemas) : {};
    const paths: Path = pathNormalizer(schema.paths);

    return {
      security,
      schemas,
      paths,
    };
  }
}
