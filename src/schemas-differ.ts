import {
  ReferenceObject,
  SchemaObject,
} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import { SchemaConverter } from "./schema-converter";
import {
  ChangeTypeEnum,
  EnumDiffType,
  Schema,
  SchemaDiffType,
  SchemaPropertyDiff,
  SchemaPropertyType,
  SchemasDifference,
} from "./types";

export class SchemasDiffer {
  sourceSchemas: Record<string, SchemaObject | ReferenceObject>;
  destinationSchemas: Record<string, SchemaObject | ReferenceObject>;

  public readonly schemasDifference: SchemasDifference;

  hasDeleteOrCreate: boolean = false;
  hasUpdate: boolean = false;

  constructor(
    source: Record<string, SchemaObject | ReferenceObject>,
    destination: Record<string, SchemaObject | ReferenceObject>
  ) {
    this.sourceSchemas = source;
    this.destinationSchemas = destination;

    this.schemasDifference = this.differs();
  }

  private differs(): SchemasDifference {
    const schemas: Set<string> = new Set<string>([
      ...Object.keys(this.sourceSchemas),
      ...Object.keys(this.destinationSchemas),
    ]);

    const schemasChanges: SchemasDifference = {};

    for (const schemaName of schemas) {
      const source: SchemaObject | undefined = this.sourceSchemas[
        schemaName
      ] as SchemaObject;
      const destination: SchemaObject | undefined = this.destinationSchemas[
        schemaName
      ] as SchemaObject;

      if (source && destination) {
        //schema updated or don't have change
        const sourceConverted: Schema = SchemaConverter.property(source);
        const destinationConverted: Schema =
          SchemaConverter.property(destination);
        schemasChanges[schemaName] = SchemasDiffer.schemaUpdate(
          sourceConverted,
          destinationConverted
        );

        if (
          !this.hasUpdate &&
          schemasChanges[schemaName].changeType === ChangeTypeEnum.updated
        ) {
          this.hasUpdate = true;
        }
      }

      if (source && !destination) {
        //schema deleted
        const sourceConverted: Schema = SchemaConverter.property(source);
        schemasChanges[schemaName] = SchemasDiffer.schemaDeleteOrUpdate(
          sourceConverted,
          ChangeTypeEnum.deleted
        );

        if (!this.hasDeleteOrCreate) {
          this.hasUpdate = true;
        }
      }

      if (!source && destination) {
        //schema created
        const destinationConverted: Schema =
          SchemaConverter.property(destination);
        schemasChanges[schemaName] = SchemasDiffer.schemaDeleteOrUpdate(
          destinationConverted,
          ChangeTypeEnum.created
        );

        if (!this.hasDeleteOrCreate) {
          this.hasUpdate = true;
        }
      }
    }
    return schemasChanges;
  }

  public static schemaUpdate(
    sourceConverted: Schema,
    destinationConverted: Schema
  ): SchemaDiffType {
    const schemaDiff: SchemaDiffType = {
      type: sourceConverted.type!,
      deprecated: destinationConverted.deprecated ?? sourceConverted.deprecated,
      ...(sourceConverted.$ref && { $ref: sourceConverted.$ref }),
      ...(destinationConverted.$ref && { $ref: destinationConverted.$ref }),
      deleted: [],
      added: [],
      changeType: ChangeTypeEnum.default,
    };

    const type: string = sourceConverted.enum ? "enum" : sourceConverted.type!;

    if (type === "enum" && sourceConverted.enum && destinationConverted.enum) {
      //if type is enum
      const diffEnum: EnumDiffType = SchemasDiffer.diffForEnum(
        sourceConverted.enum,
        destinationConverted.enum
      );
      return {
        ...schemaDiff,
        changeType:
          diffEnum.added.length > 0 || diffEnum.deleted.length > 0
            ? ChangeTypeEnum.updated
            : ChangeTypeEnum.default,
        ...diffEnum,
      };
    }
    if (
      type === "object" &&
      sourceConverted.property &&
      destinationConverted.property
    ) {
      const schemaPropertyDiff: SchemaPropertyDiff =
        SchemasDiffer.diffForProperty(
          sourceConverted.property,
          destinationConverted.property
        );

      return {
        ...schemaDiff,
        changeType:
          schemaPropertyDiff.added.length > 0 ||
          schemaPropertyDiff.deleted.length > 0
            ? ChangeTypeEnum.updated
            : ChangeTypeEnum.default,
        ...schemaPropertyDiff,
      };
    }

    return schemaDiff;
  }

  public static schemaDeleteOrUpdate(
    sourceConverted: Schema,
    changeType: ChangeTypeEnum
  ): SchemaDiffType {
    let schemaDiff: SchemaDiffType = {
      type: sourceConverted.type!,
      deprecated: sourceConverted.deprecated,
      deleted: [],
      added: [],
      changeType,
    };

    const type: string = sourceConverted.enum ? "enum" : sourceConverted.type!;

    if (type === "enum" && sourceConverted.enum) {
      //if type is enum
      schemaDiff = {
        ...schemaDiff,
        ...SchemasDiffer.diffForEnum(sourceConverted.enum, []),
      };
    }
    if (type === "object" && sourceConverted.property) {
      const schemaPropertyDiff: SchemaPropertyDiff =
        SchemasDiffer.diffForProperty(sourceConverted.property, []);

      schemaDiff = {
        ...schemaDiff,
        ...schemaPropertyDiff,
      };
    }
    return schemaDiff;
  }

  public static diffForEnum(
    oldSchema: string[],
    newSchema: string[]
  ): EnumDiffType {
    const values: string[] = [...new Set<string>([...oldSchema, ...newSchema])];
    return {
      added: values.filter((value: string) => !oldSchema.includes(value)),
      deleted: values.filter((value: string) => !newSchema.includes(value)),
      enum: values,
    };
  }

  public static diffForProperty(
    oldProperty: SchemaPropertyType[],
    newProperty: SchemaPropertyType[]
  ): SchemaPropertyDiff {
    const oldNames: string[] = oldProperty.map(
      ({ name }: SchemaPropertyType): string => name
    );
    const newNames: string[] = newProperty.map(
      ({ name }: SchemaPropertyType): string => name
    );
    const generalNames: Set<string> = new Set(
      oldNames.filter((v: string) => newNames.includes(v))
    );

    const propertyNames: string[] = [
      ...new Set<string>([...oldNames, ...newNames]),
    ];

    const added: Set<string> = new Set(
      propertyNames.filter((value: string) => !oldNames.includes(value))
    );
    const deleted: Set<string> = new Set(
      propertyNames.filter((value: string) => !newNames.includes(value))
    );

    let breakChanges: boolean = false;

    for (const propName of propertyNames) {
      const oldIndex: number = oldNames.indexOf(propName);
      const newIndex: number = newNames.indexOf(propName);

      if (
        added.has(propName) ||
        (deleted.has(propName) && (oldIndex !== -1 || newIndex !== -1))
      ) {
        if (
          oldIndex !== -1 &&
          newIndex !== -1 &&
          oldProperty[oldIndex].required !== newProperty[newIndex].required &&
          newProperty[newIndex].required
        ) {
          breakChanges = true;
          break;
        }
        if (
          oldIndex === -1 &&
          newIndex !== -1 &&
          newProperty[newIndex].required
        ) {
          breakChanges = true;
          break;
        }
      }
    }

    return {
      added: [...added.values()],
      deleted: [...deleted.values()],
      ...(breakChanges && { breakChanges }),
      property: [
        ...newProperty.filter(
          ({ name }: SchemaPropertyType) =>
            generalNames.has(name) || added.has(name)
        ),
        ...oldProperty.filter(({ name }: SchemaPropertyType) =>
          deleted.has(name)
        ),
      ],
    };
  }
}
