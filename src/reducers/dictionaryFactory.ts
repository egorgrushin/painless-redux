import { isNil, keyBy } from 'lodash';
import { IDictionary, IEntityActionOptions, IResponse, IStoreAction, IStoreEntityActionTypes } from '../types';
import { merge, updateAtPath } from '../utils';

const addList = (state: any, data: any[], options?: IEntityActionOptions) => {
	const newEntities = keyBy(data, 'id');
	if (options && options.merge) {
		return merge(state, newEntities, options.crutch);
	}
	return { ...state, ...newEntities };
};

export const createDictionaryReducer = (types: IStoreEntityActionTypes) =>
	(state: IDictionary<any> = {}, action: IStoreAction) => {
		const payload = action.payload;
		const options = action.options || {};
		switch (action.type) {
			case types.ADD: {
				const entity = payload.entity;
				return addList(state, [entity], options);
			}
			case types.ADD_LIST: {
				const response = payload.response as IResponse;
				const entities = isNil(response) ? payload.entities : response.data;
				return addList(state, entities, options);
			}
			case types.REMOVE: {
				const id = payload.id;
				const { [id]: deleted, ...rest } = state;
				return rest;
			}
			case types.CHANGE: {
				const { id, path, value } = payload;
				if (isNil(id)) return state;
				let existEntity = state[id];
				if (isNil(existEntity)) {
					if (!options.ifNotExist) return state;
					existEntity = { id: payload.id };
				}
				return {
					...state,
					[id]: updateAtPath(existEntity, path, value, options),
				};
			}
			default:
				return state;
		}
	};
