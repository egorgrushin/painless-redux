import { WorkspaceActionTypes } from './types';

export const WORKSPACE_TYPE_NAMES: (keyof WorkspaceActionTypes)[] = [
    'CHANGE',
    'SET_LOADING_STATE',
    'RESOLVE_CHANGE',
    'BATCH',
];
