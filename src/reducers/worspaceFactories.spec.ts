import { IStoreWorkspaceActionTypes } from '../types';
import { createWorkspaceValueReducer } from './worspaceFactories';

const types: IStoreWorkspaceActionTypes = {
	CHANGE: 'CHANGE',
};

describe('workspaceFactories', () => {
	const initialValue = { values: [0, 1, 2] };
	const reducer = createWorkspaceValueReducer(types, initialValue);

	test('should init value', () => {
		// act
		const actual = reducer(undefined, { type: 'INIT' });
		// assert
		expect(actual).toBe(initialValue);
	});

	test('should override arrays while changing even if new array is smaller', () => {
		// arrange
		const values = [3, 4];
		const action = { type: types.CHANGE, payload: { patch: { values } } };
		// act
		const actual = reducer(undefined, action);
		// assert
		expect(actual.values).toEqual(values);
	});

	test('should override arrays while changing even if new array is bigger', () => {
		// arrange
		const values = [3, 4, 5, 6];
		const action = { type: types.CHANGE, payload: { patch: { values } } };
		// act
		const actual = reducer(undefined, action);
		// assert
		expect(actual.values).toEqual(values);
	});

});
