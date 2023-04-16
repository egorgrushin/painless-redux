import { DeepPartial } from '../../system-types';
import { Change, ChangeableState, ChangeOptions } from './types';
import { merge as mergeFn } from '../../utils';

export const createEntityChange = <T>(
    patch: DeepPartial<T>,
    stable = false,
    merge = true,
    id?: string,
): Change<T> => ({ patch, stable, merge, id });

export const getMergedChanges = <T>(
    state: ChangeableState<T> | undefined,
    onlyStable?: boolean,
): ChangeableState<T> | undefined => {
    if (!state) return state;
    let { actual, changes = [] } = state;
    if (changes.length === 0) return state;
    let change: Change<T> | undefined;

    while ((change = changes[0])) {
        if (onlyStable && !change.stable) break;
        changes = changes.slice(1);
        const { merge, patch } = change;
        actual = merge ? mergeFn(actual, patch) : patch as T;
    }

    if (changes.length === 0) return { actual };
    return { actual, changes: changes };
};

export const createInstanceByChanges = <T>(
    state: ChangeableState<T> | undefined,
    patch: DeepPartial<T> | undefined,
    merge: boolean = true,
    success: boolean = true,
    id?: string,
): ChangeableState<T> | undefined => {
    if (!patch) return state;
    const actual = state?.actual ?? patch as T;
    const change = createEntityChange(patch, success, merge, id);
    const changes = state?.changes ?? [];
    return { actual, changes: changes.concat(change) };
};

export const resolveChanges = <T>(
    changes: Change<T>[] | undefined,
    success: boolean,
    id: string,
): Change<T>[] | undefined => {
    if (!changes) return;
    if (success) {
        return changes.map((change) => {
            if (change.id === id) return { ...change, stable: true };
            return change;
        });
    }
    return changes.filter((change) => change.id === id);
};

export const getPatchByOptions = <T>(
    patch: DeepPartial<T>,
    response: DeepPartial<T> | undefined,
    options?: ChangeOptions,
): DeepPartial<T> => {
    if (options?.optimistic) return patch;
    if (options?.useResponsePatch) return response ?? {};
    return patch;
};

export const getResolvePatchByOptions = <T>(
    patch: DeepPartial<T>,
    response: DeepPartial<T> | undefined,
    options?: ChangeOptions,
): DeepPartial<T> | undefined => {
    if (options?.useResponsePatch) return response;
};
