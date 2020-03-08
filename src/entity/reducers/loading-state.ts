import { LoadingState } from '../../system-types';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';
import { EntityActionTypes } from '../types';
import { EntityActions } from '../actions';

export const createEntityLoadingStateReducer = (
    types: EntityActionTypes,
) => (
    state: LoadingState | undefined,
    action: EntityActions,
) => {
    const loadingStateReducer = createLoadingStateReducer(types);
    if (action.type !== types.SET_STATE) return state;
    return loadingStateReducer(state, action);
};
