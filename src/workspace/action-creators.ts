import { WorkspaceActionTypes } from './types';
import { createChange, createResolveChange } from './actions';
import { createSetState } from '../shared/loading-state/actions';

export const createWorkspaceActionCreators = <T>(
    actionTypes: WorkspaceActionTypes,
) => ({
    CHANGE: createChange<T>(actionTypes),
    RESOLVE_CHANGE: createResolveChange<T>(actionTypes),
    SET_STATE: createSetState(actionTypes),
});

export type WorkspaceActionCreators = ReturnType<typeof createWorkspaceActionCreators>;
