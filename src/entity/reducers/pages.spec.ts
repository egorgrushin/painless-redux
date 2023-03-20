import { EntityActionTypes } from '../types';
import { createPagesReducer } from './pages';
import { EntityActions } from '../actions';
import { createEntityActionCreators } from '../action-creators';

jest.mock('../utils');

const types: EntityActionTypes = {
    ADD: 'ADD',
    ADD_LIST: 'ADD_LIST',
    REMOVE: 'REMOVE',
    CHANGE: 'CHANGE',
    RESOLVE_CHANGE: 'RESOLVE_CHANGE',
    SET_STATE: 'SET_STATE',
    CREATE: 'CREATE',
};

describe('pages', () => {
    const reducer = createPagesReducer(types);
    const actionCreators = createEntityActionCreators(types);

    test('should return default value', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual).toEqual({});
    });

    test('should remove id for all pages, otherwise default', () => {
        // arrange
        const action: EntityActions = actionCreators.REMOVE(1);
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
