import { merge } from '../../utils';
import { ChangeActionTypes } from './types';
import { ChangeActions } from './actions';

export const createChangeReducer = <T>(
    types: ChangeActionTypes,
    initialValue?: Partial<T>,
) => (
    state: Partial<T> | undefined = initialValue,
    action: ChangeActions,
): Partial<T> | undefined => {
    switch (action.type) {
        case types.CHANGE: {
            return merge(state, action.payload.patch);
        }
        default:
            return state;
    }
};
