import { getMergedChanges } from './utils';
import { ChangeableState } from './types';

export const getChangeableActual = <T>(
    instance: ChangeableState<T> | undefined,
): T | undefined => {
    if (!instance) return undefined;
    return getMergedChanges(instance)?.actual;
};
