import { WorkspaceActionTypes } from './types';
import { createChange, createResolveChange } from './actions';
import { createSetState } from '../shared/loading-state/actions';
import { createBatch } from '../shared/system/actions';

export const createWorkspaceActionCreators = <T>(
    actionTypes: WorkspaceActionTypes,
) => ({
    CHANGE: createChange<T>(actionTypes),
    RESOLVE_CHANGE: createResolveChange<T>(actionTypes),
    SET_STATE: createSetState(actionTypes),
    BATCH: createBatch(actionTypes),
});

export type WorkspaceActionCreators = ReturnType<typeof createWorkspaceActionCreators>;
