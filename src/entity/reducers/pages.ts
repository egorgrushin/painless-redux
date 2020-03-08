import { EntityActionTypes, Page } from '../types';
import { Dictionary } from '../../system-types';
import { EntityActions } from '../actions';
import { isNil, uniq } from 'lodash';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';

const addList = (
    state: Page,
    data: any[],
): Page => {
    const newIds = data.map(entity => entity.id);
    const oldIds = state.ids ?? [];
    return {
        ...state,
        ids: uniq(oldIds.concat(newIds)),
    };
};

const createPageReducer = (
    types: EntityActionTypes,
) => {
    const loadingStateReducer = createLoadingStateReducer(types);
    return (
        state: Page = {},
        action: EntityActions,
    ): Page => {
        switch (action.type) {
            case types.ADD_LIST: {
                let newState = state;
                if (!isNil(action.payload.hasMore)) {
                    newState = { ...state, hasMore: action.payload.hasMore };
                }
                if (action.payload.isReplace) {
                    newState = { ...newState, ids: undefined };
                }
                return addList(newState, action.payload.entities);
            }
            case types.ADD: {
                return addList(state, [action.payload.entity]);
            }
            case types.REMOVE: {
                // this check needs to clear immutable reference updating.
                // It means, no state mutating if this id doesn't exist here
                const id = action.payload.id;
                if (!state.ids?.includes(id)) return state;
                return {
                    ...state,
                    ids: state.ids.filter(existId => existId !== id),
                };
            }
            case types.SET_STATE: {
                return {
                    ...state,
                    loadingState: loadingStateReducer(state.loadingState, action),
                };
            }
            default:
                return state;
        }
    };
};

export const createPagesReducer = (
    types: EntityActionTypes,
) => {
    const pageReducer = createPageReducer(types);
    return (
        state: Dictionary<Page> = {},
        action: EntityActions,
    ): Dictionary<Page> => {
        switch (action.type) {
            case types.SET_STATE:
            case types.ADD_LIST:
            case types.ADD: {
                const hash = action.payload.configHash;
                if (isNil(hash)) return state;
                return {
                    ...state,
                    [hash]: pageReducer(state[hash], action),
                };
            }
            case types.REMOVE: {
                return Object.keys(state).reduce((
                    memo: Dictionary<Page>,
                    hash: string,
                ) => {
                    memo[hash] = pageReducer(state[hash], action);
                    return memo;
                }, {});
            }
            default:
                return state;
        }
    };
};