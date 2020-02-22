import { EntityActionTypes } from './types';

export const DEFAULT_PAGE_SIZE = 300;
export const ENTITY_TYPE_NAMES: Array<keyof EntityActionTypes> = [
    'ADD', 'ADD_LIST', 'SET_STATE', 'CHANGE', 'REMOVE',
];
