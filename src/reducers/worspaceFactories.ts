import { IStoreAction, IStoreWorkspaceActionTypes } from '../types';
import { mergeWith } from 'lodash/fp';

export const createWorkspaceValueReducer = <T>(types: IStoreWorkspaceActionTypes, initialValue: Partial<T>) => (
	state: Partial<T> = initialValue,
	action: IStoreAction,
): Partial<T> => {
	const payload = action.payload;
	switch (action.type) {
		case types.CHANGE: {
			return mergeWith((objValue, srcValue) => {
				if (Array.isArray(objValue)) return srcValue;
			}, state, payload.patch);
		}
		default:
			return state;
	}
};
