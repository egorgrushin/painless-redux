import { IStoreEntityActionTypes } from '../types';
import { createPagesReducer } from './pagesFactory';

const types: IStoreEntityActionTypes = {
	SET_STATE: 'SET_STATE',
	ADD_LIST: 'ADD_LIST',
	ADD: 'ADD',
	REMOVE: 'REMOVE',
};

describe('pagesFactory', () => {
	const reducer = createPagesReducer(types);

	test('should return default value', () => {
		// act
		const actual = reducer(undefined, { type: 'INIT' });
		// assert
		expect(actual).toEqual({});
	});

	test.each`
		configHash
		${'some-config-hash'}
		${undefined}
	`('should set state for configHash, otherwise default', ({ configHash }) => {
		// arrange
		const state = { isLoading: true };
		const action = { type: types.SET_STATE, payload: { state, configHash } };
		// act
		const actual = reducer(undefined, action);
		// assert
		const expected = configHash ? { [configHash]: { loadingState: state } } : {};
		expect(actual).toEqual(expected);
	});

	test.each`
		configHash
		${'some-config-hash'}
		${undefined}
	`('should add id for configHash, otherwise default', ({ configHash }) => {
		// arrange
		const entity = { id: 1, name: 'John' };
		const action = { type: types.ADD, payload: { entity, configHash } };
		// act
		const actual = reducer(undefined, action);
		// assert
		const expected = configHash ? { [configHash]: { ids: [entity.id] } } : {};
		expect(actual).toEqual(expected);
	});

	test.each`
		configHash
		${'some-config-hash'}
		${undefined}
	`('should add ids for configHash, otherwise default', ({ configHash }) => {
		// arrange
		const user1 = { id: 1, name: 'John' };
		const user2 = { id: 2, name: 'Frank' };
		const entities = [user1, user2];
		const action = { type: types.ADD_LIST, payload: { entities, configHash } };
		// act
		const actual = reducer(undefined, action);
		// assert
		const expected = configHash ? { [configHash]: { ids: entities.map(e => e.id) } } : {};
		expect(actual).toEqual(expected);
	});

	test('should remove id for all pages, otherwise default', () => {
		// arrange
		const action = { type: types.REMOVE, payload: { id: 1 } };
		const initialState = {
			1: { ids: [1, 2] },
			2: { ids: [2, 1] },
		};
		// act
		const actual = reducer(initialState, action);
		// assert
		const expected = {
			1: { ids: [2] },
			2: { ids: [2] },
		};
		expect(actual).toEqual(expected);
	});

});
