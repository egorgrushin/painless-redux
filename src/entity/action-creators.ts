import { EntityActionTypes } from './types';
import {
    createAdd,
    createAddList,
    createChange,
    createCreate,
    createRemove,
    createResolveChange,
    createResolveRemove,
    createSetState,
} from './actions';

export const createEntityActionCreators = <T>(
    actionTypes: EntityActionTypes,
) => ({
    ADD: createAdd<T>(actionTypes),
    CREATE: createCreate<T>(actionTypes),
    ADD_LIST: createAddList<T>(actionTypes),
    CHANGE: createChange<T>(actionTypes),
    RESOLVE_CHANGE: createResolveChange<T>(actionTypes),
    RESOLVE_REMOVE: createResolveRemove<T>(actionTypes),
    REMOVE: createRemove(actionTypes),
    SET_STATE: createSetState(actionTypes),
});

export type EntityActionCreators = ReturnType<typeof createEntityActionCreators>;
