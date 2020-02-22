import { EntityActionTypes } from './types';
import { ActionCreator, SameShaped } from '../system-types';
import {
    createAdd,
    createAddList,
    createChange,
    createCreate,
    createRemove,
    createSetState,
    EntityActions,
} from './actions';

export type EntityActionCreators = SameShaped<EntityActionTypes, ActionCreator<EntityActionTypes, EntityActions>>;
export const createEntityActionCreators = (
    actionTypes: EntityActionTypes,
): EntityActionCreators => ({
    ADD: createAdd(actionTypes),
    CREATE: createCreate(actionTypes),
    ADD_LIST: createAddList(actionTypes),
    CHANGE: createChange(actionTypes),
    REMOVE: createRemove(actionTypes),
    SET_STATE: createSetState(actionTypes),
});
