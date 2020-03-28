import { EntityActionTypes } from './types';

export const DEFAULT_PAGE_SIZE = 300;
export const ENTITY_TYPE_NAMES: Array<keyof EntityActionTypes> = [
    'ADD',
    'RESOLVE_ADD',
    'ADD_LIST',
    'SET_STATE',
    'CHANGE',
    'RESOLVE_CHANGE',
    'REMOVE',
    'RESOLVE_REMOVE',
    'RESTORE_REMOVED',
];
