import { EntityActionTypes } from './types';
import {
    createAdd,
    createAddList,
    createChange,
    createRemove,
    createResolveAdd,
    createResolveChange,
    createResolveRemove,
    createRestoreRemoved,
    createSetState,
} from './actions';

export const createEntityActionCreators = <T>(
    actionTypes: EntityActionTypes,
) => ({
    ADD: createAdd<T>(actionTypes),
    RESOLVE_ADD: createResolveAdd<T>(actionTypes),
    ADD_LIST: createAddList<T>(actionTypes),
    CHANGE: createChange<T>(actionTypes),
    RESOLVE_CHANGE: createResolveChange<T>(actionTypes),
    REMOVE: createRemove(actionTypes),
    RESOLVE_REMOVE: createResolveRemove<T>(actionTypes),
    RESTORE_REMOVED: createRestoreRemoved<T>(actionTypes),
    SET_STATE: createSetState(actionTypes),
});

export type EntityActionCreators = ReturnType<typeof createEntityActionCreators>;
