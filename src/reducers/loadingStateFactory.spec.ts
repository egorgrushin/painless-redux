/* tslint:disable:no-magic-numbers */
import { createLoadingStateReducer, loadingStateByKeysReducer, loadingStateReducer } from './loadingStateFactory';
import { IStoreEntityActionTypes } from '../types';

const types: IStoreEntityActionTypes = {
	SET_STATE: 'SET_STATE',
};

describe('loadingStateFactory', () => {
	let initialState;
	const newState = { isLoading: true };
	const someKey = 'some-key';

	beforeEach(() => {
		initialState = {};
	});

	describe('#loadingStateByKeysReducer', () => {

		test('should set state for a key', () => {
			// act
			const actual = loadingStateByKeysReducer(initialState, someKey, newState);
			// assert
			const expected = { [someKey]: newState };
			expect(actual).toEqual(expected);
		});

	});

	describe('#loadingStateReducer', () => {

		test('should set state for a key', () => {
			// act
			const actual = loadingStateReducer(initialState, someKey, newState);
			// assert
			const expected = {
				byKeys: { [someKey]: newState },
			};
			expect(actual).toEqual(expected);
		});

		test('should set state as is', () => {
			// act
			const actual = loadingStateReducer(initialState, null, newState);
			// assert
			expect(actual).toEqual(newState);
		});

	});

	describe('#createLoadingStateReducer', () => {
		const reducer = createLoadingStateReducer(types);

		test('should return default state', () => {
			// act
			const actual = reducer(undefined, { type: 'INIT' });
			// assert
			expect(actual).toEqual({ isLoading: false });
		});

		test('should delegate state reducing to loadingStateReducer if action.type=SET_STATE', () => {
			// arrange
			const action = { type: types.SET_STATE, payload: { state: newState } };
			// act
			const actual = reducer(undefined, action);
			// assert
			const expected = newState;
			expect(actual).toEqual(expected);
		});
	});
});
