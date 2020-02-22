import { EntityActionTypes } from '../types';
import { createPagesReducer } from './pages';
import { EntityActions } from '../actions';


const types: EntityActionTypes = {
    ADD: 'ADD',
    ADD_LIST: 'ADD_LIST',
    REMOVE: 'REMOVE',
    CHANGE: 'CHANGE',
    SET_STATE: 'SET_STATE',
    CREATE: 'CREATE',
};

describe('pages', () => {
    const reducer = createPagesReducer(types);

    test('should return default value', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
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
        const action: EntityActions = {
            type: types.SET_STATE,
            payload: { state, configHash, id: undefined, key: undefined },
            options: {},
        };
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
        const action: EntityActions = {
            type: types.ADD,
            payload: { entity, configHash },
            options: {},
        };
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
        const action: EntityActions = {
            type: types.ADD_LIST,
            payload: { entities, configHash, hasMore: false, isReplace: false },
            options: {},
        };
        // act
        const actual = reducer(undefined, action);
        // assert
        const expected = configHash ? {
            [configHash]: {
                ids: entities.map(e => e.id),
                hasMore: false,
            },
        } : {};
        expect(actual).toEqual(expected);
    });

    test('should remove id for all pages, otherwise default', () => {
        // arrange
        const action: EntityActions = {
            type: types.REMOVE,
            payload: { id: 1 },
            options: {},
        };
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
