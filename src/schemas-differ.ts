import {ReferenceObject, SchemaObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {SchemaConverter} from "./schema-converter";
import {Schema} from "./types/schema.type";
import {EnumDiffType} from "./types/enum-diff.type";
import {ChangeType} from "./types/change.type";
import {SchemaDiffType} from "./types/schema-diff.type";
import {SchemaPropertyType} from "./types/schema-property.type";
import {SchemaPropertyDiff} from "./types/schema-property-diff.type";
import * as fs from "fs";

export class SchemasDiffer {
  sourceSchemas: Record<string, SchemaObject | ReferenceObject>;
  destinationSchemas: Record<string, SchemaObject | ReferenceObject>;

  constructor(source: Record<string, SchemaObject | ReferenceObject>, destination: Record<string, SchemaObject | ReferenceObject>) {
    this.sourceSchemas = source;
    this.destinationSchemas = destination;

    this.differs();
  }


  differs(): void {
    const schemas: Set<string> = new Set<string>([...Object.keys(this.sourceSchemas), ...Object.keys(this.destinationSchemas)]);

    const schemasChanges: Record<string, SchemaDiffType> = {};

    for(const schemaName of schemas) {
      const source: SchemaObject | undefined = this.sourceSchemas[schemaName] as SchemaObject;
      const destination: SchemaObject | undefined = this.destinationSchemas[schemaName] as SchemaObject;

      if(source && destination){ //if schema updated or don't have change
        schemasChanges[schemaName] = this.schemaUpdate(source, destination);
      }
      if(source && !destination) {//if schema deleted
        schemasChanges[schemaName] = this.schemaDeleteOrUpdate(source, 'DELETE');
      }
      if(!source && destination) {//if schema created
        schemasChanges[schemaName] = this.schemaDeleteOrUpdate(destination, 'CREATE');
      }
    }

    console.log(schemas.size, Object.keys(schemasChanges).length);

    fs.writeFileSync('file.json', JSON.stringify(schemasChanges, null, '  '));
  }

  schemaUpdate(source: SchemaObject, destination: SchemaObject): SchemaDiffType {
    const sourceConverted: Schema = SchemaConverter.property(source);
    const destinationConverted: Schema = SchemaConverter.property(destination);
    let schemaDiff: SchemaDiffType = {
      type: sourceConverted.type!,
      deprecated: destinationConverted.deprecated ?? sourceConverted.deprecated,
      deleted: [],
      added: [],
      changeType: "DEFAULT",
    };

    const type: string = sourceConverted.enum ? 'enum' : sourceConverted.type!;

    if(type === 'enum' && sourceConverted.enum && destinationConverted.enum) { //if type is enum
      const diffEnum: EnumDiffType = this.diffForEnum(sourceConverted.enum, destinationConverted.enum);
      schemaDiff = {
        ...schemaDiff,
        changeType: diffEnum.added.length > 0 || diffEnum.deleted.length > 0 ? 'UPDATE' : 'DEFAULT',
        ...diffEnum,
      }
    }
    if(type === 'object' && sourceConverted.property && destinationConverted.property) {
      const schemaPropertyDiff: SchemaPropertyDiff = this.diffForProperty(sourceConverted.property, destinationConverted.property)

      schemaDiff = {
        ...schemaDiff,
        changeType: schemaPropertyDiff.added.length > 0 || schemaPropertyDiff.deleted.length > 0 ? 'UPDATE' : 'DEFAULT',
        ...schemaPropertyDiff,
      }
    }

    return schemaDiff;
  }

  schemaDeleteOrUpdate(source: SchemaObject, changeType: ChangeType): SchemaDiffType {
    const sourceConverted: Schema = SchemaConverter.property(source);

    let schemaDiff: SchemaDiffType = {
      type: sourceConverted.type!,
      deprecated: sourceConverted.deprecated,
      deleted: [],
      added: [],
      changeType,
    };

    const type: string = sourceConverted.enum ? 'enum' : sourceConverted.type!;

    if(type === 'enum' && sourceConverted.enum) { //if type is enum
      schemaDiff = {
        ...schemaDiff,
        ...this.diffForEnum(sourceConverted.enum, []),
      }
    }
    if(type === 'object' && sourceConverted.property) {
      const schemaPropertyDiff: SchemaPropertyDiff = this.diffForProperty(sourceConverted.property, [])

      schemaDiff = {
        ...schemaDiff,
        ...schemaPropertyDiff,
      }
    }
    return schemaDiff;
  }

  diffForEnum(oldSchema: string[], newSchema: string[]): EnumDiffType {
    const values: string[] = [...new Set<string>([...oldSchema, ...newSchema])];
    return {
      added: values.filter((value: string) => !oldSchema.includes(value)),
      deleted: values.filter((value: string) => !newSchema.includes(value)),
      enum: values,
    }
  }

  diffForProperty(oldProperty: SchemaPropertyType[], newProperty: SchemaPropertyType[]): SchemaPropertyDiff {
    const oldNames: string[] = oldProperty.map(({ name }: SchemaPropertyType): string => name);
    const newNames: string[] = newProperty.map(({ name }: SchemaPropertyType): string => name);
    const generalNames: string[] = oldNames.filter((v: string) => newNames.includes(v));

    const propertyNames: string[] = [...new Set<string>([ ...oldNames, ...newNames ])];

    const added: string[] = propertyNames.filter((value: string) => !oldNames.includes(value));
    const deleted:string[] = propertyNames.filter((value: string) => !newNames.includes(value));

    return {
      added ,
      deleted,
      property: [
        ...newProperty.filter(({ name }: SchemaPropertyType) => generalNames.includes(name) || added.includes(name)),
        ...oldProperty.filter(({ name }: SchemaPropertyType) => deleted.includes(name)),
      ]
    }
  }
}