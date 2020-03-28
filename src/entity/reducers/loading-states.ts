import { EntityActionTypes } from '../types';
import { Dictionary, Id, LoadingState } from '../../system-types';
import { EntityActions } from '../actions';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';
import { isNil } from 'lodash';

const removeState = (
    state: Dictionary<LoadingState>,
    id: Id,
    condition: boolean = true,
): Dictionary<LoadingState> => {
    if (isNil(id)) return state;
    if (!condition) return state;
    const { [id]: deleted, ...rest } = state;
    return rest;
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
            case types.SET_STATE: {
                const id = action.payload.id;
                if (isNil(id)) return state;
                const byId = entityLoadingStateReducer(state[id], action) as LoadingState;
                return { ...state, [id]: byId };
            }
            case types.RESOLVE_ADD: {
                const { payload: { tempId } } = action;
                return removeState(state, tempId);
            }
            case types.REMOVE: {
                const { payload: { id }, options: { optimistic } } = action;
                return removeState(state, id, !optimistic);
            }
            case types.RESOLVE_REMOVE: {
                const { payload: { success, id } } = action;
                return removeState(state, id, !success);
            }
            default:
                return state;
        }

    };
};
