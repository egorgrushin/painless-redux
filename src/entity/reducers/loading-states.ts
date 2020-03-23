import { EntityActionTypes } from '../types';
import { Dictionary, LoadingState } from '../../system-types';
import { EntityActions } from '../actions';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';
import { isNil } from 'lodash';

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
            case types.REMOVE: {
                const { payload: { id }, options: { safe, optimistic } } = action;
                if (isNil(id)) return state;
                if (optimistic || safe) return state;
                const { [id]: deleted, ...rest } = state;
                return rest;
            }
            case types.RESOLVE_REMOVE: {
                const { payload: { success, id }, options: { safe } } = action;
                if (isNil(id)) return state;
                if (!success || safe) return state;
                const { [id]: deleted, ...rest } = state;
                return rest;
            }
            default:
                return state;
        }

    };
};
