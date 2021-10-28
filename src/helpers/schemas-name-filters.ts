export function UpdatedSchemasNames(schemasNames: string[]): string[] {
    return schemasNames.filter((name: string) => !(name.includes('__added') || name.includes('__deleted')));
}

export function DeletedSchemasNames(schemasNames: string[]): string[] {
    return schemasNames.filter((name: string) => name.includes('__deleted'));
}

export function CreatedSchemasNames(schemasNames: string[]): string[] {
    return schemasNames.filter((name: string) => name.includes('__added'));
}