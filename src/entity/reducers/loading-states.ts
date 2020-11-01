import { EntityActionTypes } from '../types';
import { Dictionary, Id, LoadingState } from '../../system-types';
import { EntityActions } from '../actions';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';
import { isNil } from 'lodash';
import { removeFromObject } from '../../utils';

const removeState = (
    state: Dictionary<LoadingState>,
    ids: Id[] = [],
    condition: boolean = true,
): Dictionary<LoadingState> => {
    if (!condition) return state;
    return removeFromObject(state, ids);
};

export const createByIdLoadingStatesReducer = (
    types: EntityActionTypes,
) => {
    const entityLoadingStateReducer = createLoadingStateReducer(types);
    return (
        state: Dictionary<LoadingState> = {},
        action: EntityActions,
    ): Dictionary<LoadingState> => {
        switch (action.type) {
            case types.SET_LOADING_STATE: {
                const id = action.payload.id;
                if (isNil(id)) return state;
                const byId = entityLoadingStateReducer(state[id], action) as LoadingState;
                return { ...state, [id]: byId };
            }
            case types.RESOLVE_ADD: {
                const { payload: { tempId } } = action;
                return removeState(state, [tempId]);
            }
            case types.REMOVE: {
                const { payload: { id }, options: { optimistic } } = action;
                return removeState(state, [id], !optimistic);
            }
            case types.RESOLVE_REMOVE: {
                const { payload: { success, id } } = action;
                return removeState(state, [id], !success);
            }
            case types.REMOVE_LIST: {
                const { payload: { ids }, options: { optimistic } } = action;
                return removeState(state, ids, !optimistic);
            }
            case types.RESOLVE_REMOVE_LIST: {
                const { payload: { success, ids } } = action;
                return removeState(state, ids, !success);
            }
            case types.CLEAR_ALL: {
                return {};
            }
            default:
                return state;
        }

    };
};
