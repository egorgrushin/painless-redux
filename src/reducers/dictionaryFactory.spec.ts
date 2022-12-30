import { createDictionaryReducer } from './dictionaryFactory';
import { IStoreEntityActionTypes } from '../types';

const types: IStoreEntityActionTypes = {
	ADD: 'ADD',
	ADD_LIST: 'ADD_LIST',
	REMOVE: 'REMOVE',
	CHANGE: 'CHANGE',
};

describe('dictionaryFactory', () => {
	const reducer = createDictionaryReducer(types);

	test('should return default state', () => {
		// act
		const actual = reducer(undefined, { type: 'INIT' });
		// assert
		expect(actual).toEqual({});
	});

	test('should add entity', () => {
		// arrange
		const entity = { id: 1 };
		const payload = { entity };
		const action = { type: types.ADD, payload };
		// act
		const actual = reducer(undefined, action);
		// assert
		const expected = { [entity.id]: entity };
		expect(actual).toEqual(expected);
	});

	test('should add entities', () => {
		// arrange
		const entities = [{ id: 1 }, { id: 2 }];
		const payload = { entities };
		const action = { type: types.ADD_LIST, payload };
		// act
		const actual = reducer(undefined, action);
		// assert
		const expected = entities.reduce((memo, entity) => {
			memo[entity.id] = entity;
			return memo;
		}, {});
		expect(actual).toEqual(expected);
	});

	test.each`
		merge
		${true}
		${undefined}
	`('should merge entity with the same if options.merge option passed, otherwise replace ($merge)', ({ merge }) => {
		// arrange
		const entity = { id: 1, name: 'entity 1' };
		const action = { type: types.ADD, payload: { entity } };
		const entity2 = { id: 1, age: 1 };
		const action2 = {
			type: types.ADD,
			payload: { entity: entity2 },
			options: { merge },
		};
		// act
		const actual = reducer(reducer(undefined, action), action2);
		// assert
		const expected = merge ? {
			id: 1,
			name: 'entity 1',
			age: 1,
		} : { id: 1, age: 1 };
		expect(actual[entity.id]).toEqual(expected);
	});

	test('should remove entity', () => {
		// arrange
		const entity = { id: 1 };
		const action = { type: types.REMOVE, payload: { id: entity.id } };
		// act
		const actual = reducer({
			[entity.id]: entity,
		}, action);
		// assert
		const expected = {};
		expect(actual).toEqual(expected);
	});

	describe('#CHANGE', () => {
		test('should change entity', () => {
			// arrange
			const entity = { id: 1, name: 'entity 1' };
			const action = {
				type: types.CHANGE, payload: {
					id: entity.id,
					path: 'name',
					value: 'entity 2',
				},
			};
			// act
			const actual = reducer({
				[entity.id]: entity,
			}, action);
			// assert
			const expected = {
				id: 1, name: 'entity 2',
			};
			expect(actual[entity.id]).toEqual(expected);
		});

		test('should override entity nested array', () => {
			// arrange
			const entity = {
				id: 1,
				profile: {
					rates: [1, 2, 3],
				},
			};
			const action = {
				type: types.CHANGE, payload: {
					id: entity.id,
					path: 'profile.rates',
					value: [3, 4, 5, 6],
				},
			};
			// act
			const actual = reducer({
				[entity.id]: entity,
			}, action);
			// assert
			const expected = {
				id: 1, profile: { rates: [3, 4, 5, 6] },
			};
			expect(actual[entity.id]).toEqual(expected);
		});

		test.each`
			merge
			${true}
			${undefined}
		`('should override entity when no merge option passed and merge otherwise ($merge)', ({ merge }) => {
			// arrange
			const entity = {
				id: 1,
				profile: {
					image: '1.png',
				},
			};
			const action = {
				type: types.CHANGE, payload: {
					id: entity.id,
					path: 'profile',
					value: {
						age: 18,
					},
				},
				options: { merge },
			};
			// act
			const actual = reducer({
				[entity.id]: entity,
			}, action);
			// assert
			const expected = merge ? {
				image: '1.png',
				age: 18,
			} : { age: 18 };
			expect(actual[entity.id].profile).toEqual(expected);
		});

		test.each`
			ifNotExist
			${undefined}
			${true}
		`('should create entity if options.ifNotExist=true, otherwise ignore ($ifNotExist)',
			({ ifNotExist }) => {
				// arrange
				const action = {
					type: types.CHANGE, payload: {
						id: 1,
						path: 'profile',
						value: {
							age: 18,
						},
					},
					options: { ifNotExist },
				};
				// act
				const actual = reducer(undefined, action);
				// assert
				const expected = ifNotExist ? {
					[action.payload.id]: {
						id: action.payload.id,
						profile: { age: 18 },
					},
				} : {};
				expect(actual).toEqual(expected);
			},
		);
	});
});
