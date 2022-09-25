import { isNil, uniq } from 'lodash';
import { IDictionary, IPage, IStoreAction, IStoreEntityActionTypes } from '../types';
import { createLoadingStateReducer } from './loadingStateFactory';

const addList = (state: IPage, data: any[]) => {
	const newIds = data.map(entity => entity.id);
	const oldIds = state.ids || [];
	return {
		...state,
		ids: uniq(oldIds.concat(newIds)),
	};
};

const createPageReducer = (types: IStoreEntityActionTypes) => {
	const loadingStateReducer = createLoadingStateReducer(types);
	return (state: IPage = {}, action: IStoreAction) => {
		const payload = action.payload;
		switch (action.type) {
			case types.ADD_LIST: {
				let newState = state;
				if (!isNil(payload.hasMore)) {
					newState = { ...state, hasMore: payload.hasMore };
				}
				if (payload.isReplace) {
					newState = { ...newState, ids: null };
				}
				return addList(newState, payload.entities);
			}
			case types.ADD: {
				return addList(state, [payload.entity]);
			}
			case types.REMOVE: {
				// this check needs to clear immutable reference updating.
				// It means, no state mutating if this id doesn't exist here
				if (!state.ids || !state.ids.includes(payload.id)) return state;
				return {
					...state,
					ids: state.ids.filter(id => id !== payload.id),
				};
			}
			case types.SET_STATE: {
				return {
					...state,
					loadingState: loadingStateReducer(state.loadingState, action),
				};
			}
			default:
				return state;
		}
	};
};

export const createPagesReducer = (types: IStoreEntityActionTypes) => {
	const pageReducer = createPageReducer(types);
	return (state: IDictionary<IPage> = {}, action: IStoreAction) => {
		const payload = action.payload;
		switch (action.type) {
			case types.SET_STATE:
			case types.ADD_LIST:
			case types.ADD: {
				const hash = payload.configHash;
				if (isNil(hash)) return state;
				return {
					...state,
					[hash]: pageReducer(state[hash], action),
				};
			}
			case types.REMOVE: {
				return Object.keys(state).reduce((memo, hash) => {
					memo[hash] = pageReducer(state[hash], action);
					return memo;
				}, {});
			}
			default:
				return state;
		}
	};
};
