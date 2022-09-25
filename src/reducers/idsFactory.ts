import { isNil } from 'lodash';
import { Id, IEntityActionOptions, IResponse, IStoreAction, IStoreEntityActionTypes } from '../types';

const getOnlyNewIds = (state, ids) => {
	return ids.filter(id => !state.includes(id));
};

const addIds = (state, ids, options: IEntityActionOptions = {}) => {
	const newIds = getOnlyNewIds(state, ids);
	if (options.pasteIndex) {
		const pre = state.slice(0, options.pasteIndex);
		const post = state.slice(options.pasteIndex);
		return pre.concat(newIds, post);
	}
	return state.concat(newIds);
};

export const createIdsReducer = (types: IStoreEntityActionTypes) =>
	(state: Id[] = [], action: IStoreAction) => {
		const payload = action.payload;
		const options = action.options;
		switch (action.type) {
			case types.ADD: {
				const response = payload.response as IResponse;
				const entity = isNil(response) ? payload.entity : response.data;
				return addIds(state, [entity.id], options);
			}
			case types.CHANGE: {
				const index = state.indexOf(payload.id);
				if (index === -1) {
					if (!options.ifNotExist) return state;
					return addIds(state, [payload.id], options);
				}
				return state;
			}
			case types.ADD_LIST: {
				const response = payload.response as IResponse;
				const entities = isNil(response) ? payload.entities : response.data;
				const ids = entities.map((e) => e.id);
				return addIds(state, ids, options);
			}
			case types.REMOVE: {
				return state.filter(id => id !== payload.id);
			}
			default:
				return state;
		}
	};
