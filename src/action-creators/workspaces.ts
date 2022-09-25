import { IStoreAction, IStoreWorkspaceActionTypes } from '../types';

export const change = (types: IStoreWorkspaceActionTypes) => (
	patch: object,
	label: string,
): IStoreAction => {
	const payload = { patch };
	return { type: types.CHANGE, payload, label };
};

export { setState } from './states';
