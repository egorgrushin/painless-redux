import { EntityActionTypes, EntityInstanceState, EntityType, UnstableChange } from '../types';
import { EntityActions } from '../actions';
import { omit } from 'lodash';
import { merge as mergeFn } from '../../utils';
import { DeepPartial } from '../../system-types';

const createUnstableChange = <T>(
    patch: DeepPartial<T>,
    stable = false,
    merge = true,
    id?: string,
): UnstableChange<T> => ({ patch, stable, merge, id });

export const mergeStableChanges = <T>(
    state: EntityInstanceState<T>,
    mergeAll?: boolean,
): EntityInstanceState<T> => {
    let { actual, unstableChanges = [] } = state;
    if (unstableChanges.length === 0) return state;
    let change: UnstableChange<T> | undefined;

    while ((change = unstableChanges[0])) {
        if (!change.stable && !mergeAll) break;
        unstableChanges = unstableChanges.slice(1);
        const { merge, patch } = change;
        actual = merge ? mergeFn(actual, patch) : patch;
    }

    if (unstableChanges.length === 0) return { actual };
    return { actual, unstableChanges };
};

export const createInstanceReducer = <T>(types: EntityActionTypes) => (
    state: EntityInstanceState<T> | undefined,
    action: EntityActions,
): EntityInstanceState<T> | undefined => {
    switch (action.type) {
        case types.ADD: {
            const { options, payload: { entity } } = action;
            let newState;
            if (options.merge && state) {
                const { unstableChanges = [], actual } = state;
                const patch = omit(entity, 'id');
                const change = createUnstableChange<T>(patch, true, true);
                newState = { actual, unstableChanges: unstableChanges.concat(change) };
            } else {
                newState = { actual: entity as EntityType<T> };
            }
            return mergeStableChanges(newState);
        }
        case types.CHANGE: {
            // FIXME(egorgrushin): add support ifNotExist flag
            if (!state) return state;
            const { options: { optimistic, merge }, payload: { id, patch, changeId } } = action;
            const { unstableChanges = [], actual } = state;
            const resultPatch = merge ? patch : { id, ...patch };
            const change = createUnstableChange<T>(resultPatch, !optimistic, merge, changeId);
            const newState = { actual, unstableChanges: unstableChanges.concat(change) };
            return mergeStableChanges(newState);
        }
        case types.RESOLVE_CHANGE: {
            if (!state) return state;
            const { payload: { success, changeId, remotePatch } } = action;
            let { unstableChanges = [] } = state;
            if (remotePatch) {
                const change = createUnstableChange<T>(remotePatch, true);
                unstableChanges = unstableChanges.concat(change);
            }
            if (success) {
                unstableChanges = unstableChanges.map((change) => {
                    if (change.id === changeId) return { ...change, success };
                    return change;
                });
            } else {
                unstableChanges = unstableChanges.filter((change) => change.id === changeId);
            }
            const newState = { ...state, unstableChanges };
            return mergeStableChanges(newState);
        }
        case types.REMOVE: {
            if (!state) return state;
            const { options: { optimistic, safe } } = action;
            if (safe || optimistic) return { ...state, removed: true };
            return undefined;
        }
        default:
            return state;
    }
};
