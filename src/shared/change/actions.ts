import { ChangeActionOptions, ChangeActionTypes } from './types';
import { typedDefaultsDeep } from '../../utils';

export const createChange = (types: ChangeActionTypes) => (
    patch: any,
    options?: ChangeActionOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { patch };
    return { type: types.CHANGE, payload, options } as const;
};

export type ChangeActions = ReturnType<ReturnType<typeof createChange>>
