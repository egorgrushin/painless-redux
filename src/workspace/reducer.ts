import { WorkspaceActionTypes, WorkspaceState } from './types';
import { Reducer } from '../system-types';
// @ts-ignore
import * as combineReducers from 'combine-reducers';
import { WorkspaceActions } from './actions';
import { createLoadingStateReducer } from '../shared/loading-state/reducers';
import { createChangeReducer } from '../shared/change/reducer';

export const createWorkspaceReducer = <T>(
    actionTypes: WorkspaceActionTypes,
    initialValue?: Partial<T>,
): Reducer<WorkspaceState<T>, WorkspaceActions> => combineReducers<WorkspaceState<T>, WorkspaceActions>({
    value: createChangeReducer(actionTypes, initialValue),
    loadingState: createLoadingStateReducer(actionTypes),
});
