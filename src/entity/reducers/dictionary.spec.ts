import { EntityActionTypes } from '../types';
import { createDictionaryReducer } from './dictionary';
import { Id } from '../../system-types';
import { createEntityActionCreators } from '../action-creators';

const types: EntityActionTypes = {
    ADD: 'ADD',
    ADD_LIST: 'ADD_LIST',
    REMOVE: 'REMOVE',
    CHANGE: 'CHANGE',
    SET_STATE: 'SET_STATE',
    CREATE: 'CREATE',
    RESOLVE_CHANGE: 'RESOLVE_CHANGE',
};

type TestEntity = {
    id: Id;
    profile?: {
        image?: string;
        age?: number;
        name?: string;
    },
}

const actionCreators = createEntityActionCreators<TestEntity>(types);
const reducer = createDictionaryReducer<TestEntity>(types);

describe('dictionary', () => {

    test('should return default state', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual).toEqual({});
    });

    test('should add entity', () => {
        // arrange
        const entity: TestEntity = { id: 1 };
        const action = actionCreators.ADD(entity);
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = { [entity.id]: { actual: entity } };
        expect(actual).toEqual(expected);
    });

    test('should add entities', () => {
        // arrange
        const entities = [{ id: 1 }, { id: 2 }];
        const action = actionCreators.ADD_LIST(entities, null);
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = entities.reduce((
            memo: any,
            entity: any,
        ) => {
            memo[entity.id] = { actual: entity };
            return memo;
        }, {});
        expect(actual).toEqual(expected);
    });

    test.each`
		options
		${{ merge: true }}
		${{ merge: false }}
	`('should merge entity with the same if options.merge option passed, otherwise replace ($options)', ({ options }) => {
        // arrange
        const entity = { id: 1, name: 'entity 1' };
        const action = actionCreators.ADD(entity);
        const entity2 = { id: 1, age: 1 };
        const action2 = actionCreators.ADD(entity2, undefined, options);
        // act
        const instances = reducer(reducer(undefined, action), action2);
        const actual = instances[entity.id].actual;
        // assert
        const expected = options.merge ? { id: 1, name: 'entity 1', age: 1 } : { id: 1, age: 1 };
        expect(actual).toEqual(expected);
    });

    test('should remove entity', () => {
        // arrange
        const entity: TestEntity = { id: 1 };
        const action = actionCreators.REMOVE(entity.id);
        // act
        const actual = reducer({
            [entity.id]: {
                actual: entity,
                unstableChanges: [],
            },
        }, action);
        // assert
        const expected = {};
        expect(actual).toEqual(expected);
    });

    describe('#CHANGE', () => {
        test.each`	
		    options
		    ${{ merge: true }}
		    ${{ merge: false }}
		`('should override entity when no merge option passed and merge otherwise ($options)', ({ options }) => {
            // arrange
            const entity: TestEntity = { id: 1, profile: { image: '1.png' } };
            const patch = { profile: { age: 18 } };
            const action = actionCreators.CHANGE(entity.id, patch, undefined, options);
            // act
            const instances = reducer({
                [entity.id]: {
                    actual: entity,
                    unstableChanges: [],
                },
            }, action);
            // assert
            const expected = options.merge ? { image: '1.png', age: 18 } : { age: 18 };
            const actual = instances[entity.id].actual.profile;
            expect(actual).toEqual(expected);
        });

        xtest.each`
			ifNotExist
			${undefined}
			${true}
		`(
            'should either create entity or ignore based on options.ifNotExist=$ifNotExist',
            ({ ifNotExist }) => {
                // arrange
                const patch = { profile: { age: 18 } };
                const action = actionCreators.CHANGE(1, patch);
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
