import { ChangeActionTypes, ChangeOptions } from './types';
import { typedDefaultsDeep } from '../../utils';
import { DeepPartial } from '../../system-types';

export const createChange = <T>(types: ChangeActionTypes) => (
    patch: DeepPartial<T>,
    changeId?: string,
    options?: ChangeOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { patch, changeId };
    return { type: types.CHANGE, payload, options } as const;
};

export const createResolveChange = <T>(types: ChangeActionTypes) => (
    changeId: string,
    success: boolean,
    remotePatch?: DeepPartial<T>,
    options?: ChangeOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { changeId, success, remotePatch };
    return { type: types.RESOLVE_CHANGE, payload, options } as const;
};

type SelfActionCreators = ReturnType<typeof createChange>
    | ReturnType<typeof createResolveChange>;

export type ChangeActions = ReturnType<SelfActionCreators>
