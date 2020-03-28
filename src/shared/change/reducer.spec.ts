import { ChangeActionTypes } from './types';
import { createChangeReducer } from './reducer';
import { ChangeActions } from './actions';


const types: ChangeActionTypes = {
    CHANGE: 'CHANGE',
};

describe('change', () => {
    const initialValue = { values: [0, 1, 2], key: 'test' };
    const reducer = createChangeReducer(types, initialValue);

    test('should init value', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual).toBe(initialValue);
    });

    test('should override arrays while changing even if new array is smaller', () => {
        // arrange
        const values = [3, 4];
        const action: ChangeActions = {
            type: types.CHANGE,
            payload: { patch: { values } },
            options: {},
        };
        // act
        const actual = reducer(initialValue, action);
        // assert
        expect(actual?.values).toEqual(values);
    });

    test('should override arrays while changing even if new array is bigger', () => {
        // arrange
        const values = [3, 4, 5, 6];
        const action: ChangeActions = {
            type: types.CHANGE,
            payload: { patch: { values } },
            options: {},
        };
        // act
        const actual = reducer(initialValue, action);
        // assert
        expect(actual?.values).toEqual(values);
    });

    test('should set only given properties to undefined', () => {
        // arrange
        const action: ChangeActions = {
            type: types.CHANGE,
            payload: { patch: { values: undefined } },
            options: {},
        };

        // act
        const actual = reducer(initialValue, action);
        // assert
        expect(actual).toEqual({ ...initialValue, values: undefined });

    });

});
