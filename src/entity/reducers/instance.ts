import { EntityActionTypes, EntityInstanceState, EntityType } from '../types';
import { EntityActions } from '../actions';
import { createLoadingStateReducer } from '../../shared/loading-state/reducers';
import { createEntityChange, getMergedChanges } from '../utils';

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
                    options: { optimistic, merge, ifNotExist },
                    payload: { id, patch, changeId },
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
            case types.RESOLVE_REMOVE: {
                if (!state) return state;
                const {
                    payload: { success },
                    options: { safe },
                } = action;
                if (safe || state.removed === false) return state;
                if (success) return undefined;
                return { ...state, removed: false };
            }
            case types.RESTORE_REMOVED: {
                if (!state) return state;
                return { ...state, removed: false };
            }
            default:
                return state;
        }
    };
};
