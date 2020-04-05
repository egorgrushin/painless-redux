import { SystemActionTypes } from './types';

export const createBatch = <T>(types: SystemActionTypes) => (actions: T[]) => {
    const payload = { actions };
    return { type: types.BATCH, payload } as const;
};

export type SystemActions = ReturnType<ReturnType<typeof createBatch>>;
