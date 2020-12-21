import { LoadingState } from '../../system-types';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';
import { EntityActionTypes } from '../types';
import { EntityActions } from '../actions';
import { RequestOptions } from '../../shared/types';

export const createEntityLoadingStateReducer = (
    types: EntityActionTypes,
) => (
    state: LoadingState | undefined,
    action: EntityActions,
) => {
    const loadingStateReducer = createLoadingStateReducer(types);
    if (action.type !== types.SET_LOADING_STATE) return state;
    if ((action.options as RequestOptions)?.globalLoadingState === false) return state;
    return loadingStateReducer(state, action);
};
