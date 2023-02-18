import { EntityActionTypes, EntityType, Page } from '../types';
import { Dictionary } from '../../system-types';
import { EntityActions } from '../actions';
import { isNil, uniq } from 'lodash-es';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';
import { MAX_PAGES_COUNT } from '../constants';
import { removeFromArray } from '../../utils';

const addList = <T, TPageMetadata>(
    state: Page<TPageMetadata> | undefined,
    data: EntityType<T>[],
): Page<TPageMetadata> => {
    const newIds = data.map(entity => entity.id);
    const oldIds = state?.ids ?? [];
    return {
        ...state,
        ids: uniq(oldIds.concat(newIds)),
    };
};

const createPageReducer = <TPageMetadata>(
    types: EntityActionTypes,
) => {
    const loadingStateReducer = createLoadingStateReducer(types);
    return (
        state: Page<TPageMetadata> | undefined,
        action: EntityActions,
    ): Page<TPageMetadata> | undefined => {
        switch (action.type) {
            case types.ADD_LIST: {
                let newState = state ?? { ids: [] };
                if (!isNil(action.payload.hasMore)) {
                    newState = { ...newState, hasMore: action.payload.hasMore };
                }
                if (!isNil(action.payload.metadata)) {
                    newState = { ...newState, metadata: action.payload.metadata as TPageMetadata }
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
                const { payload: { id }, options: { safe, optimistic } } = action;
                if (optimistic || safe) return state;
                // this check needs to clear immutable reference updating.
                // It means, no state mutating if this id doesn't exist here
                if (!state?.ids?.includes(id)) return state;
                return {
                    ...state,
                    ids: removeFromArray(state.ids, [id]),
                };
            }
            case types.RESOLVE_REMOVE: {
                const { payload: { success, id }, options: { safe } } = action;
                if (!success || safe) return state;
                // this check needs to clear immutable reference updating.
                // It means, no state mutating if this id doesn't exist here
                if (!state?.ids?.includes(id)) return state;
                return {
                    ...state,
                    ids: removeFromArray(state.ids, [id]),
                };
            }
            case types.REMOVE_LIST: {
                const { payload: { ids }, options: { safe, optimistic } } = action;
                if (optimistic || safe) return state;
                if (!state?.ids) return state;
                // this check needs to clear immutable reference updating.
                // It means, no state mutating if this id doesn't exist here
                const hasIds = ids.some((id) => state.ids?.includes(id));
                if (!hasIds) return state;
                return {
                    ...state,
                    ids: removeFromArray(state.ids, ids),
                };
            }

            case types.RESOLVE_REMOVE_LIST: {
                const { payload: { success, ids }, options: { safe } } = action;
                if (!success || safe) return state;
                if (!state?.ids) return state;
                // this check needs to clear immutable reference updating.
                // It means, no state mutating if this id doesn't exist here
                const hasIds = ids.some((id) => state.ids?.includes(id));
                if (!hasIds) return state;
                return {
                    ...state,
                    ids: removeFromArray(state.ids, ids),
                };
            }
            case types.RESOLVE_ADD: {
                const { payload: { success, tempId, result } } = action;
                if (!state) return state;
                if (success) return {
                    ...state,
                    ids: state.ids?.map((id) => {
                        if (id === tempId) return result.id;
                        return id;
                    }),
                };
                return {
                    ...state,
                    ids: removeFromArray(state?.ids ?? [], [tempId]),
                };
            }
            case types.SET_LOADING_STATE: {
                return {
                    ...state,
                    ids: state?.ids,
                    loadingState: loadingStateReducer(state?.loadingState, action),
                };
            }
            default:
                return state;
        }
    };
};

export const createPagesReducer = <TPageMetadata>(
    types: EntityActionTypes,
) => {
    const pageReducer = createPageReducer<TPageMetadata>(types);
    return (
        state: Dictionary<Page<TPageMetadata>> = {},
        action: EntityActions,
    ): Dictionary<Page<TPageMetadata>> => {
        switch (action.type) {
            case types.SET_LOADING_STATE:
            case types.ADD_LIST:
            case types.ADD: {
                const {
                    payload: { configHash },
                    options: { maxPagesCount = MAX_PAGES_COUNT },
                } = action;
                if (isNil(configHash)) return state;
                const pageExist = configHash in state;
                const page = pageReducer(state[configHash], action);
                if (!page) return state;
                const newState = { ...state, [configHash]: page };
                if (pageExist) return newState;
                const pageHashes = Object.keys(newState);
                const pagesCount = pageHashes.length;
                page.order = pagesCount - 1;
                if (pagesCount <= maxPagesCount) return newState;
                return pageHashes.reduce((memo: Dictionary<Page<TPageMetadata>>, hash: string) => {
                    const existPage = newState[hash];
                    if (existPage.order === 0) return memo;
                    memo[hash] = {
                        ...existPage,
                        order: (existPage.order ?? pagesCount) - 1,
                    };
                    return memo;
                }, {});
            }
            case types.RESOLVE_ADD:
            case types.REMOVE:
            case types.RESOLVE_REMOVE:
            case types.REMOVE_LIST:
            case types.RESOLVE_REMOVE_LIST: {
                return Object.keys(state).reduce((
                    memo: Dictionary<Page<TPageMetadata>>,
                    hash: string,
                ) => {
                    const page = pageReducer(state[hash], action);
                    if (!page) return memo;
                    memo[hash] = page;
                    return memo;
                }, {});
            }
            case types.CLEAR: {
                const hash = action.payload.configHash;
                const { [hash]: deleted, ...rest } = state;
                return rest;
            }
            case types.CLEAR_ALL: {
                return {};
            }
            default:
                return state;
        }
    };
};
