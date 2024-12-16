import { Id } from '../../system-types';
import { createTestHelpers } from '../../testing/helpers';
import { createDictionaryReducer } from './dictionary';
import { IdEntityPair } from '../types';

type TestEntity = {
    id: Id;
    profile?: {
        image?: string;
        age?: number;
        name?: string;
    },
}
type TPageMetadata = any;

const {
    reducer,
    actionCreators,
} = createTestHelpers<TestEntity, TPageMetadata>(createDictionaryReducer);

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
        const pair: IdEntityPair<TestEntity> = { entity, id: entity.id };
        const action = actionCreators.ADD(pair);
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = { [entity.id]: { actual: entity } };
        expect(actual).toEqual(expected);
    });

    test('should add entities', () => {
        // arrange
        const entities = [{ id: 1 }, { id: 2 }];
        const pairs: IdEntityPair<TestEntity>[] = entities.map((entity) => ({
            entity,
            id: entity.id,
        }));
        const action = actionCreators.ADD_LIST(pairs, null);
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
        const pair1: IdEntityPair<TestEntity> = { entity, id: entity.id };
        const action = actionCreators.ADD(pair1);
        const entity2 = { id: 1, age: 1 };
        const pair2: IdEntityPair<TestEntity> = { entity: entity2, id: entity2.id };
        const action2 = actionCreators.ADD(pair2, undefined, undefined, options);
        // act
        const instances = [action, action2].reduce(reducer, undefined);
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
                changes: [],
            },
        }, action);
        // assert
        const expected = {};
        expect(actual).toEqual(expected);
    });

    test('should remove entities', () => {
        // arrange
        const entity1: TestEntity = { id: 1 };
        const entity2: TestEntity = { id: 2 };
        const action = actionCreators.REMOVE_LIST([entity1.id, entity2.id]);
        // act
        const actual = reducer({
            [entity1.id]: {
                actual: entity1,
                changes: [],
            },
            [entity2.id]: {
                actual: entity2,
                changes: [],
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
                    changes: [],
                },
            }, action);
            // assert
            const expected = options.merge ? { image: '1.png', age: 18 } : { age: 18 };
            const actual = instances[entity.id].actual.profile;
            expect(actual).toEqual(expected);
        });

        test.each`
            ifNotExist
            ${undefined}
            ${true}
        `(
            'should either create entity or ignore based on options.ifNotExist=$ifNotExist',
            ({ ifNotExist }) => {
                // arrange
                const id = 1;
                const patch = { profile: { age: 18 } };
                const action = actionCreators.CHANGE(id, patch, undefined, { ifNotExist });
                // act
                const actual = reducer(undefined, action);
                // assert
                const expected = ifNotExist ? {
                    [id]: { actual: { profile: { age: 18 } } },
                } : {};
                const expectedKeys = ifNotExist ? [id.toString()] : [];
                expect(Object.keys(actual)).toEqual(expectedKeys);
                expect(actual).toEqual(expected);
            },
        );
    });
});
