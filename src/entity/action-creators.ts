import { EntityActionTypes, EntitySchema, IdResolver } from './types';
import {
    createAdd,
    createAddList,
    createChange,
    createChangeList,
    createClear,
    createClearAll,
    createRemove,
    createRemoveList,
    createResolveAdd,
    createResolveChange,
    createResolveChangeList,
    createResolveRemove,
    createResolveRemoveList,
    createRestoreRemoved,
    createRestoreRemovedList,
    createSetLoadingState,
    createSetLoadingStates,
} from './actions';
import { createBatch } from '../shared/system/actions';
import { EntityActionCreators } from './action-creators.types';

export const createEntityActionCreators = <T, TPageMetadata>(
    actionTypes: EntityActionTypes,
    schema: EntitySchema<T>,
): EntityActionCreators<T, TPageMetadata> => ({
    ADD: createAdd<T>(actionTypes, schema),
    RESOLVE_ADD: createResolveAdd<T>(actionTypes, schema),
    ADD_LIST: createAddList<T, TPageMetadata>(actionTypes, schema),
    CHANGE: createChange<T>(actionTypes),
    RESOLVE_CHANGE: createResolveChange<T>(actionTypes),
    REMOVE: createRemove(actionTypes),
    RESOLVE_REMOVE: createResolveRemove(actionTypes),
    RESTORE_REMOVED: createRestoreRemoved(actionTypes),
    REMOVE_LIST: createRemoveList(actionTypes),
    RESOLVE_REMOVE_LIST: createResolveRemoveList(actionTypes),
    RESTORE_REMOVED_LIST: createRestoreRemovedList(actionTypes),
    SET_LOADING_STATE: createSetLoadingState(actionTypes, schema),
    CLEAR: createClear(actionTypes, schema),
    CLEAR_ALL: createClearAll(actionTypes),
    BATCH: createBatch<T>(actionTypes),
    CHANGE_LIST: createChangeList<T>(actionTypes),
    SET_LOADING_STATES: createSetLoadingStates(actionTypes),
    RESOLVE_CHANGE_LIST: createResolveChangeList<T>(actionTypes),
});
