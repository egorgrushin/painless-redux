import { createIdsReducer } from './ids';
import { EntityActionTypes } from '../types';
import { EntityActions } from '../actions';


const types: EntityActionTypes = {
    ADD: 'ADD',
    ADD_LIST: 'ADD_LIST',
    REMOVE: 'REMOVE',
    CHANGE: 'CHANGE',
    SET_STATE: 'SET_STATE',
    CREATE: 'CREATE',
};

describe('ids', () => {

    const reducer = createIdsReducer(types);

    describe('#ADD', () => {
        test('should add entity id', () => {
            // arrange
            const entity = { id: 1 };
            const action: EntityActions = {
                type: types.ADD,
                payload: {
                    entity,
                    configHash: '',
                },
                options: {},
            };
            // act
            const actual = reducer(undefined, action);
            // assert
            const expected = [entity.id];
            expect(actual).toEqual(expected);
        });

        test('should add entity id to options.pasteIndex', () => {
            // arrange
            const action: EntityActions = {
                type: types.ADD,
                payload: { entity: { id: 99 }, configHash: '' },
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
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual).toEqual([]);
    });

    test('should add entity ids from payload.$source', () => {
        // arrange
        const entities = [{ id: 1 }, { id: 2 }];
        const action: EntityActions = {
            type: types.ADD_LIST,
            payload: {
                entities,
                configHash: '',
                isReplace: false,
                hasMore: false,
            },
            options: {},
        };
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = entities.map((entity) => entity.id);
        expect(actual).toEqual(expected);
    });

    test('should remove entity id', () => {
        // arrange
        const entity = { id: 3 };
        const action: EntityActions = {
            type: types.REMOVE,
            payload: { id: entity.id },
            options: {},
        };
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
        const action: EntityActions = {
            type: types.CHANGE,
            payload: { id: 1, patch: {} },
            options: { ifNotExist: true, merge: true, },
        };
        const initialState = exist ? [1] : [];
        // act
        const actual = reducer(initialState, action);
        // assert
        const expected = [1];
        expect(actual).toEqual(expected);
    });

});
