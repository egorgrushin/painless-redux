import { WorkspaceActionTypes, WorkspaceState } from './types';
import { Reducer } from '../system-types';
import { combineReducers } from '../shared/utils';
import { WorkspaceActions } from './actions';
import { createLoadingStateReducer } from '../shared/loading-state/reducers';
import { createChangeReducer } from '../shared/change/reducer';
import { batchActionsReducerFactory } from '../shared/system/reducers';

export const createBaseReducer = <T>(
    actionTypes: WorkspaceActionTypes,
    initialValue?: Partial<T>,
): Reducer<WorkspaceState<T>, WorkspaceActions> => combineReducers<WorkspaceState<T>, WorkspaceActions>({
    value: createChangeReducer<T>(actionTypes, initialValue as T),
    loadingState: createLoadingStateReducer(actionTypes),
});

export const createWorkspaceReducer = <T>(
    actionTypes: WorkspaceActionTypes,
    initialValue?: Partial<T>,
): Reducer<WorkspaceState<T>, WorkspaceActions> => {
    const baseReducer = createBaseReducer<T>(actionTypes, initialValue);
    return batchActionsReducerFactory(actionTypes, baseReducer);
};
