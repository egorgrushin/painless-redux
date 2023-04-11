import { ChangeActionTypes } from './types';
import { createChangeReducer } from './reducer';
import { createChange } from './actions';

const types: ChangeActionTypes = {
    CHANGE: 'CHANGE',
    RESOLVE_CHANGE: 'RESOLVE_CHANGE',
};

describe('change', () => {
    const initialActual = { values: [0, 1, 2], key: 'test' };
    const initialValue = { actual: initialActual };
    const reducer = createChangeReducer(types, initialActual);

    test('should init value', () => {
        // act
        const actual = reducer(undefined, { type: 'INIT' } as any);
        // assert
        expect(actual?.actual).toBe(initialActual);
    });

    test('should override arrays while changing even if new array is smaller', () => {
        // arrange
        const values = [3, 4];
        const action = createChange(types)({ values });
        // act
        const actual = reducer(initialValue, action);
        // assert
        expect(actual?.actual.values).toEqual(values);
    });

    test('should override arrays while changing even if new array is bigger', () => {
        // arrange
        const values = [3, 4, 5, 6];
        const action = createChange(types)({ values });
        // act
        const actual = reducer(initialValue, action);
        // assert
        expect(actual?.actual.values).toEqual(values);
    });

    test('should set only given properties to undefined', () => {
        // arrange
        const action = createChange(types)({ values: undefined });
        // act
        const actual = reducer(initialValue, action);
        // assert
        expect(actual?.actual).toEqual({ ...initialActual, values: undefined });

    });

});
