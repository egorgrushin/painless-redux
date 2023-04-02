import { EntityActionTypes, EntityInstanceState } from '../types';
import { EntityActions } from '../actions';
import { createInstanceByChanges, getMergedChanges, resolveChanges } from '../utils';

export const createInstanceReducer = <T>(types: EntityActionTypes) => (
    state: EntityInstanceState<T> | undefined,
    action: EntityActions,
): EntityInstanceState<T> | undefined => {
    switch (action.type) {
        case types.ADD: {
            const {
                options: { optimistic, merge },
                payload: { entity, tempId },
            } = action;
            const instance = createInstanceByChanges<T>(
                state,
                entity as any,
                merge,
                !optimistic,
                tempId,
            );
            return getMergedChanges(instance, true);
        }
        case types.CHANGE: {
            const {
                options: { ifNotExist, merge, optimistic },
                payload: { id, patch, changeId },
            } = action;
            if (!ifNotExist && !state) return state;
            const patchWithId = { id, ...patch };
            const resultPatch = ifNotExist ? patchWithId : patch;
            const instance = createInstanceByChanges<T>(
                state,
                resultPatch,
                merge,
                !optimistic,
                changeId,
            );
            return getMergedChanges(instance, true);
        }
        case types.RESOLVE_CHANGE: {
            if (!state) return state;
            const {
                payload: { success, changeId, remotePatch },
                options: { merge, optimistic },
            } = action;
            state = createInstanceByChanges<T>(
                state,
                remotePatch,
                merge,
                !optimistic,
                changeId,
            ) as EntityInstanceState<T>;
            const changes = resolveChanges(state?.changes, success, changeId);
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
