import { createLoadingStateReducer, loadingStateReducer } from './reducers';
import { LoadingState } from '../../system-types';
import { LoadingStateActionTypes } from './types';
import { LoadingStateActions } from './actions';

const types: LoadingStateActionTypes = {
    SET_STATE: 'SET_STATE',
};


describe('loadingState', () => {
    let initialState: any;
    const newState = { isLoading: true };
    const someKey = 'some-key';

    beforeEach(() => {
        initialState = {};
    });

    describe('#createLoadingStateReducer', () => {
        const reducer = createLoadingStateReducer(types);

        test('should return default state', () => {
            // act
            const actual = reducer(undefined, { type: 'INIT' } as any);
            // assert
            expect(actual).toEqual(undefined);
        });

        test('should correct set state', () => {
            // arrange
            const action: LoadingStateActions = {
                type: types.SET_STATE,
                payload: {
                    state: newState,
                    key: undefined,
                },
                options: {},
            };
            // act
            const actual = reducer(undefined, action);
            // assert
            const expected = newState;
            expect(actual).toEqual(expected);
        });
    });

    describe('#loadingStateReducer', () => {

        test('should set state for a key', () => {
            // act
            const actual = loadingStateReducer(initialState, someKey, newState);
            // assert
            const expected: LoadingState = {
                byKeys: { [someKey]: newState },
                isLoading: false,
            };
            expect(actual).toEqual(expected);
        });

        test('should set state as is', () => {
            // act
            const actual = loadingStateReducer(initialState, undefined, newState);
            // assert
            expect(actual).toEqual(newState);
        });

    });

});
