import { createPagesReducer } from './pages';
import { EntityActions } from '../actions';
import { createTestHelpers } from '../../testing/helpers';

jest.mock('../utils');

const {
    reducer,
    actionCreators,
} = createTestHelpers(createPagesReducer);

describe('pages', () => {

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

    test('should remove ids for all pages, otherwise default', () => {
        // arrange
        const action: EntityActions = actionCreators.REMOVE_LIST([1, 2]);
        const initialState = {
            1: { ids: [1, 2, 3] },
            2: { ids: [2, 1, 5] },
        };
        // act
        const actual = reducer(initialState, action);
        // assert
        const expected = {
            1: { ids: [3] },
            2: { ids: [5] },
        };
        expect(actual).toEqual(expected);
    });

});
