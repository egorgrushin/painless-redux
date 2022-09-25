import { defaultsDeep } from 'lodash';
import { Id, IEntityActionOptions, IStoreAction, IStoreEntityActionTypes } from '../types';
import { controlId, hashIt } from '../utils';

// FIXME(yrgrushi): refactor it to classes

export const add = (types: IStoreEntityActionTypes) => (
	entity: any,
	config?: any,
	options?: IEntityActionOptions,
): IStoreAction => {
	const configHash = hashIt(config);
	controlId(entity);
	options = defaultsDeep(options, { merge: true });
	const payload = { entity, configHash };
	return { type: types.ADD, payload, options };
};

export const addList = (types: IStoreEntityActionTypes) => (
	entities: any[],
	config?: any,
	isReplace?: boolean,
	hasMore?: boolean,
	options?: IEntityActionOptions,
): IStoreAction => {
	const configHash = hashIt(config);
	entities = entities.map(e => controlId(e));
	options = defaultsDeep(options, { merge: true });
	const payload = { entities, configHash, isReplace, hasMore };
	return { type: types.ADD_LIST, payload, options };
};

export const create = add;

export const remove = (types: IStoreEntityActionTypes) => (
	id: Id,
	options?: IEntityActionOptions,
): IStoreAction => {
	options = defaultsDeep(options);
	const payload = { id };
	return { type: types.REMOVE, payload, options };
};
