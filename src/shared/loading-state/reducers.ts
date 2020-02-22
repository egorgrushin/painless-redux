import { Dictionary, LoadingState } from '../../system-types';
import { LoadingStateActionTypes } from './types';
import { LoadingStateActions } from './actions';


const pureLoadingStateReducer = (
    state: LoadingState | undefined,
    newState: LoadingState,
): LoadingState => ({ ...state, ...newState });

export const loadingStateByKeysReducer = (
    state: Dictionary<LoadingState> = {},
    key: string,
    newState: LoadingState,
): Dictionary<LoadingState> => {
    return {
        ...state,
        [key]: pureLoadingStateReducer(state[key], newState),
    };
};

export const loadingStateReducer = (
    state: LoadingState | undefined,
    key: string | undefined,
    newState: LoadingState,
): LoadingState => {
    if (!key) return pureLoadingStateReducer(state, newState);
    return {
        ...state,
        byKeys: loadingStateByKeysReducer(state?.byKeys, key, newState),
        isLoading: state?.isLoading ?? false,
    };
};


export const createLoadingStateReducer = (
    types: LoadingStateActionTypes,
) => (
    state: LoadingState | undefined,
    action: LoadingStateActions,
) => {
    switch (action.type) {
        case types.SET_STATE: {
            const { key, state: newState } = action.payload;
            return loadingStateReducer(state, key, newState);
        }
        default:
            return state;
    }
};
