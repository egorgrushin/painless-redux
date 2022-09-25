import { Id, IEntityActionOptions, IStoreAction, IStoreEntityActionTypes } from '../types';
import { defaultsDeep } from 'lodash';

export const change = (types: IStoreEntityActionTypes) => (
	id: Id,
	value: any,
	path?: number | string | Array<string | number>,
	options?: IEntityActionOptions,
): IStoreAction => {
	options = defaultsDeep(options, { merge: true });
	const payload = { id, path, value };
	return { type: types.CHANGE, payload, options };
};
