import { IStoreAction, IStoreEntityActionTypes } from '../types';
import { hashIt } from '../utils';

export const setState = (types: IStoreEntityActionTypes) => (
	config: any,
	id,
	state,
	key?: string,
	options?,
): IStoreAction => {
	const configHash = config && hashIt(config);
	const payload = { id, state, key, configHash };
	return { type: types.SET_STATE, payload, options };
};

export const removeState = (types: IStoreEntityActionTypes) => (
	id,
	options?,
): IStoreAction => {
	const payload = { id };
	return { type: types.REMOVE_STATE, payload, options };
};
