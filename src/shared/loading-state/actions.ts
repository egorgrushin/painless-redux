import { LoadingStateActionTypes, LoadingStateSetOptions } from './types';
import { LoadingState } from '../../system-types';
import { typedDefaultsDeep } from '../../utils';

export const createSetLoadingState = (types: LoadingStateActionTypes) => (
    state: LoadingState,
    key?: string,
    options?: LoadingStateSetOptions,
) => {
    options = typedDefaultsDeep(options);
    const payload = { state, key };
    return { type: types.SET_LOADING_STATE, payload, options } as const;
};

export type LoadingStateActions = ReturnType<ReturnType<typeof createSetLoadingState>>;
