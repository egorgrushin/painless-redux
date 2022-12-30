
import { IStoreEntityActionTypes } from '../types';
import { createLoadingStatesByIdReducer } from './loadingStateByIdFactory';

const types: IStoreEntityActionTypes = {
	SET_STATE: 'SET_STATE',
	REMOVE: 'REMOVE',
	REMOVE_STATE: 'REMOVE_STATE',
};

describe('loadingStateByIdFactory', () => {
	const reducer = createLoadingStatesByIdReducer(types);

	test('should return default state', () => {
		// act
		const actual = reducer(undefined, { type: 'INIT' });
		// assert
		expect(actual).toEqual({});
	});

	test.each`
		id
		${undefined}
		${5}
	`('should set state for payload.id=$id', ({ id }) => {
		// arrange
		const state = { isLoading: true };
		const action = {
			type: types.SET_STATE,
			payload: { id, state },
		};
		const initialState = {};
		// act
		const actual = reducer(initialState, action);
		// assert
		if (id) {
			expect(actual).toEqual({ [id]: state });
		} else {
			expect(actual).toEqual({});
		}
	});

	test.each`
		type
		${types.REMOVE}
		${types.REMOVE_STATE}
	`('should remove state also when removing entity (action.type=$type)', ({ type }) => {
		// arrange
		const action = { type, payload: { id: 5 } };
		const initialState = { 5: {} };
		// act
		const actual = reducer(initialState, action);
		// assert
		const expected = {};
		expect(actual).toEqual(expected);
	});
});
