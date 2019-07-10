import { ILoadingState, IStoreAction, IStoreLoadingStateActionTypes } from '../types';

const pureLoadingStateReducer = (state: ILoadingState, newState: ILoadingState) => ({ ...state, ...newState });

export const loadingStateByKeysReducer = (state: any = {}, key: string, newState: ILoadingState) => {
	return {
		...state,
		[key]: pureLoadingStateReducer(state[key], newState),
	};
};

export const loadingStateReducer = (state: ILoadingState, key: string, newState: ILoadingState) => {
	if (!key) {
		return pureLoadingStateReducer(state, newState);
	}
	return {
		...state,
		byKeys: loadingStateByKeysReducer(state.byKeys, key, newState),
	};
};

export const createLoadingStateReducer = (types: IStoreLoadingStateActionTypes) =>
	(state: ILoadingState = { isLoading: false }, action: IStoreAction) => {
		const payload = action.payload;
		switch (action.type) {
			case types.SET_STATE: {
				// FIXME(yrgrushi): it has to update only id if id is specified
				const key = payload.key;
				return loadingStateReducer(state, key, payload.state);
			}
			default:
				return state;
		}
	};
