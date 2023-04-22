export type ChangeLogRenderSaveType = {
  /**
   * place where you want save html and css files
   */
  path: string;
  /**
   * html file name
   * @example 'apiName'
   */
  fileName: string;
  /**
   * optional field: in feature I will (maybe) add more formats.
   * @example 'html'
   */
  format?: "html";

  /**
   * paste versioning in file name
   * @example 'apiName.1.0.1.html'
   */
  pasteVersionInName?: boolean;
};
