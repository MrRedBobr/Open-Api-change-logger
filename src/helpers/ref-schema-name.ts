export function RefSchemaName(refPath: string): string {
  return refPath.split('/').reverse()[0];
}
