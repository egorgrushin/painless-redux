import { EntityActionTypes, EntityChange, EntityInstanceState, EntityType } from '../types';
import { EntityActions } from '../actions';
import { merge as mergeFn } from '../../utils';
import { DeepPartial } from '../../system-types';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';

const createEntityChange = <T>(
    patch: DeepPartial<T>,
    stable = false,
    merge = true,
    id?: string,
): EntityChange<T> => ({ patch, stable, merge, id });

export const getMergedChanges = <T>(
    state: EntityInstanceState<T>,
    onlyStable?: boolean,
): EntityInstanceState<T> => {
    let { actual, changes = [] } = state;
    if (changes.length === 0) return state;
    let change: EntityChange<T> | undefined;

    while ((change = changes[0])) {
        if (onlyStable && !change.stable) break;
        changes = changes.slice(1);
        const { merge, patch } = change;
        actual = merge ? mergeFn(actual, patch) : patch;
    }

    if (changes.length === 0) return { actual };
    return { actual, changes: changes };
};

export const createInstanceReducer = <T>(types: EntityActionTypes) => {

    const loadingStateReducer = createLoadingStateReducer(types);
    return (
        state: EntityInstanceState<T> | undefined,
        action: EntityActions,
    ): EntityInstanceState<T> | undefined => {
        switch (action.type) {
            case types.ADD: {
                const { options, payload: { entity } } = action;
                let newState;
                if (state) {
                    const { changes = [], actual } = state;
                    const patch = entity as any;
                    const change = createEntityChange<T>(patch, true, options.merge);
                    newState = { actual, changes: changes.concat(change) };
                } else {
                    newState = { actual: entity as EntityType<T> };
                }
                return getMergedChanges(newState, true);
            }
            case types.CHANGE: {
                const {
                    options: {
                        optimistic,
                        merge,
                        ifNotExist,
                    }, payload: {
                        id,
                        patch,
                        changeId,
                    },
                } = action;
                const patchWithId = { id, ...patch };
                if (!state) {
                    if (!ifNotExist) return state;
                    return { actual: patchWithId as EntityType<T> };
                }
                const { changes = [], actual } = state || {};
                const resultPatch = merge ? patch : patchWithId;
                const change = createEntityChange<T>(resultPatch, !optimistic, merge, changeId);
                const newState = { actual, changes: changes.concat(change) };
                return getMergedChanges(newState, true);
            }
            case types.RESOLVE_CHANGE: {
                if (!state) return state;
                const { payload: { success, changeId, remotePatch }, options: { merge } } = action;
                let changes = state.changes ?? [];
                if (remotePatch) {
                    const change = createEntityChange<T>(remotePatch, true, merge, changeId);
                    changes = changes.concat(change);
                }
                if (success) {
                    changes = changes.map((change) => {
                        if (change.id === changeId) return { ...change, stable: true };
                        return change;
                    });
                } else {
                    changes = changes.filter((change) => change.id === changeId);
                }
                const newState = { ...state, changes };
                return getMergedChanges(newState, true);
            }
            case types.REMOVE: {
                if (!state) return state;
                const { options: { optimistic, safe } } = action;
                if (safe || optimistic) return { ...state, removed: true };
                return undefined;
            }
            case types.SET_STATE: {
                if (!state) return state;
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
