import {PathsObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export class PathsDeffer {
  source: PathsObject;
  destination: PathsObject;
  constructor(source: PathsObject, destination: PathsObject) {
    this.source = source;
    this.destination = destination;
    this.pathsDiff();
  }

  pathsDiff(): void {
    const paths_addresses: Set<string> = new Set<string>([...Object.keys(this.source), ...Object.keys(this.destination)]);

    for(const path_address of [...paths_addresses.values()].slice(2)) {
      if(this.source[path_address] && this.destination[path_address]) {
        console.log(path_address);
      }
    }
  }
}