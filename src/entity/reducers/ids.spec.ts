import { createIdsReducer } from './ids';
import { createTestHelpers } from '../../testing/helpers';
import { IdEntityPair } from '../types';

const {
    reducer,
    actionCreators,
} = createTestHelpers(createIdsReducer);

describe('ids', () => {

    describe('#ADD', () => {
        test('should add entity id', () => {
            // arrange
            const entity = { id: 1 };
            const pair: IdEntityPair<any> = { entity, id: entity.id };
            const action = actionCreators.ADD(pair);
            // act
            const actual = reducer(undefined, action);
            // assert
            const expected = [entity.id];
            expect(actual).toEqual(expected);
        });

        test('should add entity id to options.pasteIndex', () => {
            // arrange
            const entity = { id: 99 };
            const pair: IdEntityPair<any> = { entity, id: entity.id };
            const action = actionCreators.ADD(pair, undefined, undefined, { pasteIndex: 2 });
            // act
            const actual = reducer([1, 2, 3, 4], action);
            // assert
            const expected = [1, 2, 99, 3, 4];
            expect(actual).toEqual(expected);
        });
    });

    test('should return default state', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual).toEqual([]);
    });

    test('should add entity ids from payload.$source', () => {
        // arrange
        const entities = [{ id: 1 }, { id: 2 }];
        const pairs: IdEntityPair<any>[] = entities.map((entity) => ({
            entity,
            id: entity.id,
        }));
        const action = actionCreators.ADD_LIST(pairs);
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = entities.map((entity) => entity.id);
        expect(actual).toEqual(expected);
    });

    test('should remove entity id', () => {
        // arrange
        const entity = { id: 3 };
        const action = actionCreators.REMOVE(entity.id);// act
        const actual = reducer([1, 2, entity.id, 4], action);
        // assert
        const expected = [1, 2, 4];
        expect(actual).toEqual(expected);
    });

    test('should remove entities ids', () => {
        // arrange
        const entity1 = { id: 3 };
        const entity2 = { id: 4 };
        const action = actionCreators.REMOVE_LIST([entity1.id, entity2.id]);// act
        const actual = reducer([1, 2, entity1.id, entity2.id], action);
        // assert
        const expected = [1, 2];
        expect(actual).toEqual(expected);
    });

    test.each`
		exist
		${true}
		${false}
	`('should add entity id when change if options.ifNotExist options passed and not exist($exist)', ({ exist }) => {
        // arrange
        const action = actionCreators.CHANGE(1, {}, undefined, { ifNotExist: true });
        const initialState = exist ? [1] : [];
        // act
        const actual = reducer(initialState, action);
        // assert
        const expected = [1];
        expect(actual).toEqual(expected);
    });

});
