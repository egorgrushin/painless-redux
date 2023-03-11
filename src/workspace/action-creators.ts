import { ActionCreator, SameShaped } from '../system-types';
import { WorkspaceActionTypes } from './types';
import { createChange, WorkspaceActions } from './actions';
import { createSetState } from '../shared/loading-state/actions';

export type WorkspaceActionCreators = SameShaped<WorkspaceActionTypes, ActionCreator<WorkspaceActionTypes, WorkspaceActions>>;
export const createWorkspaceActionCreators = (
    actionTypes: WorkspaceActionTypes,
): WorkspaceActionCreators => ({
    CHANGE: createChange(actionTypes),
    SET_STATE: createSetState(actionTypes),
});
