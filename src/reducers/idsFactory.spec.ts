
import { IStoreEntityActionTypes } from '../types';
import { createIdsReducer } from './idsFactory';

const types: IStoreEntityActionTypes = {
	ADD: 'ADD',
	ADD_LIST: 'ADD_LIST',
	REMOVE: 'REMOVE',
	CHANGE: 'CHANGE',
};

describe('idsFactory', () => {

	const reducer = createIdsReducer(types);

	describe('#ADD', () => {
		test('should add entity id', () => {
			// arrange
			const entity = { id: 1 };
			const payload = { entity };
			const action = { type: types.ADD, payload };
			// act
			const actual = reducer(undefined, action);
			// assert
			const expected = [entity.id];
			expect(actual).toEqual(expected);
		});

		test('should add entity id to options.pasteIndex', () => {
			// arrange
			const action = {
				type: types.ADD,
				payload: { entity: { id: 99 } },
				options: { pasteIndex: 2 },
			};
			// act
			const actual = reducer([1, 2, 3, 4], action);
			// assert
			const expected = [1, 2, 99, 3, 4];
			expect(actual).toEqual(expected);
		});
	});

	test('should return default state', () => {
		// act
		const actual = reducer(undefined, { type: 'INIT' });
		// assert
		expect(actual).toEqual([]);
	});

	test('should add entity ids from payload.$source', () => {
		// arrange
		const entities = [{ id: 1 }, { id: 2 }];
		const payload = { entities };
		const action = { type: types.ADD_LIST, payload };
		// act
		const actual = reducer(undefined, action);
		// assert
		const expected = entities.map((entity) => entity.id);
		expect(actual).toEqual(expected);
	});

	test('should remove entity id', () => {
		// arrange
		const entity = { id: 3 };
		const action = { type: types.REMOVE, payload: { id: entity.id } };
		// act
		const actual = reducer([1, 2, entity.id, 4], action);
		// assert
		const expected = [1, 2, 4];
		expect(actual).toEqual(expected);
	});

	test.each`
		exist
		${true}
		${false}
	`('should add entity id when change if options.ifNotExist options passed and not exist($exist)', ({ exist }) => {
		// arrange
		const action = {
			type: types.CHANGE,
			payload: { id: 1 },
			options: { ifNotExist: true },
		};
		const initialState = exist ? [1] : [];
		// act
		const actual = reducer(initialState, action);
		// assert
		const expected = [1];
		expect(actual).toEqual(expected);
	});

});
