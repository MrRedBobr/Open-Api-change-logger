import {ReferenceObject, SchemaObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SchemaObjectType(schema: SchemaObject): string {
    let type: string = schema.type ?? '';
    type = schema.type && schema.type === 'array' ? `[${(schema.items as SchemaObject)['type'] ?? (schema.items as ReferenceObject)['$ref']?.split('/').pop()}]` : type;
    type = schema.type && schema.type === 'string' && schema.enum ? `enum` : type;
    if (schema.allOf) {
        const refTypeName: string = (schema.allOf[0] as ReferenceObject).$ref.split('/').pop() ?? '';
        type = refTypeName;
    }
    return type;
}