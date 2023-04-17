import { EntityActionTypes } from './types';
import {
    createAdd,
    createAddList,
    createChange,
    createClear,
    createClearAll,
    createRemove,
    createResolveAdd,
    createResolveChange,
    createResolveRemove,
    createRestoreRemoved,
    createSetState,
} from './actions';
import { createBatch } from '../shared/system/actions';

export const createEntityActionCreators = <T>(
    actionTypes: EntityActionTypes,
) => ({
    ADD: createAdd(actionTypes),
    RESOLVE_ADD: createResolveAdd(actionTypes),
    ADD_LIST: createAddList(actionTypes),
    CHANGE: createChange<T>(actionTypes),
    RESOLVE_CHANGE: createResolveChange<T>(actionTypes),
    REMOVE: createRemove(actionTypes),
    RESOLVE_REMOVE: createResolveRemove<T>(actionTypes),
    RESTORE_REMOVED: createRestoreRemoved<T>(actionTypes),
    SET_STATE: createSetState(actionTypes),
    CLEAR: createClear(actionTypes),
    CLEAR_ALL: createClearAll(actionTypes),
    BATCH: createBatch(actionTypes),
});

export type EntityActionCreators = ReturnType<typeof createEntityActionCreators>;
