import {ChangeTypeEnum} from "../types";

export const ChangeTypeText = (changeType: ChangeTypeEnum, paragraphNumber: number = 2): string =>
  `<h${paragraphNumber} class="change-type">${changeType.toLowerCase()}</h${paragraphNumber}>`;