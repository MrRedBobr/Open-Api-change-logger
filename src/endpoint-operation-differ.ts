import {OperationObject} from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import {ChangeType} from "./types/change.type";

export class EndpointOperationDiffer {
  public changeType: ChangeType = 'DEFAULT';

  constructor(source?: OperationObject, destination?: OperationObject) {
    if(source && destination){
      this.changeType = 'DEFAULT';
      this.forDefault();
      return;
    }
    if(source && !destination) {
      this.changeType = 'DELETE';
      return;
    }
    if(!source && destination) {
      this.changeType = 'CREATE';
      return;
    }
  }

  forDefault(): void {

  }
}