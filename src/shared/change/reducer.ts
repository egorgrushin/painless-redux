import { ChangeableState, ChangeActionTypes } from './types';
import { ChangeActions } from './actions';
import { createInstanceByChanges, getMergedChanges, resolveChanges } from './utils';

export const createChangeReducer = <T>(
    types: ChangeActionTypes,
    initialActual?: T,
) => (
    state: ChangeableState<T> | undefined,
    action: ChangeActions,
): ChangeableState<T> | undefined => {
    if (!state && initialActual) {
        state = { actual: initialActual };
    }
    switch (action.type) {
        case types.CHANGE: {
            const {
                payload: { patch, changeId },
                options: { merge, optimistic },
            } = action;
            const instance = createInstanceByChanges<T>(
                state,
                patch,
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
            const instance = createInstanceByChanges<T>(
                state,
                remotePatch,
                merge,
                !optimistic,
                changeId,
            ) as ChangeableState<T>;
            const changes = resolveChanges(instance?.changes, success, changeId);
            const newState = { ...instance, changes };
            return getMergedChanges(newState, true);
        }
        default:
            return state;
    }
};
