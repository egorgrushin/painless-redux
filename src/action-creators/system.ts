import { IStoreAction } from '../types';

export const UNDO_ACTION = 'UNDO_ACTION';
export const BATCH_ACTIONS = 'BATCH_ACTIONS';

export const undo = (action: any): IStoreAction => {
	return { type: UNDO_ACTION, payload: action };
};

export const batchActions = (actions: any): IStoreAction => {
	return { type: BATCH_ACTIONS, payload: actions };
};
