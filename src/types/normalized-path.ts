import { PathOperations } from '../interfaces/paths';

/**
 * @example {
 *   ['tagName']: {
 *     ['https/suite-address.com/endpoint']: {
 *       ['get']: OperationObject;
 *       ['patch']: OperationObject;
 *     }
 *   }
 * }
 */
export type PathByTag = Record<string, Path>;

/**
 * @example {
 *   ['https/suite-address.com/endpoint']: {
 *     ['get']: OperationObject
 *     ['patch']: OperationObject;
 *   }
 * }
 */
export type Path = Record<string, PathOperations>;
