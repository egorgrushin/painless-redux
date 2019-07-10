import { isNil } from 'lodash';
import { IDictionary, ILoadingState, IStoreAction, IStoreEntityActionTypes } from '../types';
import { createLoadingStateReducer } from './loadingStateFactory';

export const createLoadingStatesByIdReducer = (types: IStoreEntityActionTypes) => {
	const loadingStateReducer = createLoadingStateReducer(types);
	return (state: IDictionary<ILoadingState> = {}, action: IStoreAction) => {
		const payload = action.payload;
		switch (action.type) {
			case types.SET_STATE: {
				const id = payload.id;
				if (isNil(id)) return state;
				return {
					...state,
					[id]: loadingStateReducer(state[id], action),
				};
			}
			case types.REMOVE:
			case types.REMOVE_STATE: {
				const { [payload.id]: deleted, ...rest } = state;
				return rest;
			}
			default:
				return state;
		}
	};
};
