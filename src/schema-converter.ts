import {ReferenceObject, SchemaObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {Schema, SchemaPropertyType} from "./types";

export class SchemaConverter {
  public static properties(properties: Record<string, ReferenceObject | SchemaObject>, required?: string[]): SchemaPropertyType[] {
    const keys: string[] = Object.keys(properties);
    const prop: SchemaPropertyType[] = [];
    for (const key of keys) {
      const property: ReferenceObject | SchemaObject = properties[key];
      prop.push({
        name: key,
        required: required?.includes(key) ?? false,
        ...SchemaConverter.property(property),
      });
    }
    return prop;
  }

  public static property(property: ReferenceObject | SchemaObject): Schema {
    if ('$ref' in property) {
      return {
        $ref: this.getRefModelName(property.$ref),
        deprecated: false,
        type: 'ref',
      }
    } else {
      return {
        deprecated: property.deprecated ?? false,
        type: property.type ?? ' ',

        // if param is enum
        ...((property.enum) && {
          type: 'enum',
          enum: property.enum,
        }),

        // if param is array
        ...(!(property.enum || (property as any).new) && property.items && {
          ...(
            '$ref' in property.items ?
              {$ref: this.getRefModelName(property.items.$ref), type: 'ref[]'} :
              {type: `${property.items.type}[]`}
          )
        }),

        ...(property.properties && {
          type: 'object',
          property: [...this.properties(property.properties, property.required)],
        }),

        ...(property.format && {format: property.format}),

        ...(property.allOf && property.allOf.length === 1 && {
          type: 'ref',
          ...('$ref' in property.allOf[0] ?
              {
                $ref: this.getRefModelName(property.allOf[0].$ref),
              } : {}
          )
        }),

        ...(property.allOf && property.allOf.length > 1 && {
          type: property.title ?? property.type,
          property: [
            //  todo find schema and put all properties here

            ...property.allOf.slice(1).flatMap((sc: SchemaObject | ReferenceObject) => {
              if ('$ref' in sc || !sc.properties) return [];
              return [...SchemaConverter.properties(sc.properties, sc.required ?? [])]
            })
          ]
        })
      }
    }
  }

  public static getRefModelName(ref: string): string {
    return ref.split('/').pop() ?? ref;
  }
}