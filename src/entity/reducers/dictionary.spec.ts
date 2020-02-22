import { EntityActionTypes } from '../types';
import { createDictionaryReducer } from './dictionary';
import { EntityActions } from '../actions';
import { Dictionary } from '../../system-types';


const types: EntityActionTypes = {
    ADD: 'ADD',
    ADD_LIST: 'ADD_LIST',
    REMOVE: 'REMOVE',
    CHANGE: 'CHANGE',
    SET_STATE: 'SET_STATE',
    CREATE: 'CREATE',
};

describe('dictionary', () => {
    const reducer = createDictionaryReducer(types);

    test('should return default state', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual).toEqual({});
    });

    test('should add entity', () => {
        // arrange
        const entity = { id: 1 };
        const payload = { entity, configHash: '' };
        const action: EntityActions = { type: types.ADD, payload, options: {} };
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = { [entity.id]: entity };
        expect(actual).toEqual(expected);
    });

    test('should add entities', () => {
        // arrange
        const entities = [{ id: 1 }, { id: 2 }];
        const action: EntityActions = {
            type: types.ADD_LIST,
            payload: {
                entities,
                configHash: '',
                hasMore: false,
                isReplace: false,
            },
            options: {},
        };
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = entities.reduce((
            memo: any,
            entity: any,
        ) => {
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
        const action: EntityActions = {
            type: types.ADD,
            payload: { entity, configHash: '' },
            options: {},
        };
        const entity2 = { id: 1, age: 1 };
        const action2: EntityActions = {
            type: types.ADD,
            payload: { entity: entity2, configHash: '' },
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
        const action: EntityActions = {
            type: types.REMOVE,
            payload: { id: entity.id },
            options: {},
        };
        // act
        const actual = reducer({
            [entity.id]: entity,
        }, action);
        // assert
        const expected = {};
        expect(actual).toEqual(expected);
    });

    describe('#CHANGE', () => {
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
            const action: EntityActions = {
                type: types.CHANGE,
                payload: {
                    id: entity.id,
                    patch: {
                        profile: { age: 18 },
                    },
                },
                options: { merge },
            };
            // act
            const actual: Dictionary<any> = reducer({
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
		`(
            'should create entity if options.ifNotExist=true, otherwise ignore ($ifNotExist)',
            ({ ifNotExist }) => {
                // arrange
                const action: EntityActions = {
                    type: types.CHANGE,
                    payload: {
                        id: 1,
                        patch: {
                            profile: { age: 18 },
                        },
                    },
                    options: { ifNotExist, merge: true },
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
