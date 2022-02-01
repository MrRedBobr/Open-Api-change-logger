import {ChangeType} from "../types/change.type";

export const ChangeTypeText = (changeType: ChangeType, paragraphNumber: number = 2): string =>
  `<h${paragraphNumber} class="change-type">${changeType.toLowerCase()}</h${paragraphNumber}>`;