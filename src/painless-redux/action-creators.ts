import { SystemActionTypes } from '../shared/system/types';
import { createUndo, SystemActions } from '../shared/system/actions';
import { ActionCreator, SameShaped } from '../system-types';


export type SystemActionCreators = SameShaped<SystemActionTypes, ActionCreator<SystemActionTypes, SystemActions>>;

export const createSystemActionCreators = (actionTypes: SystemActionTypes): SystemActionCreators => ({
    UNDO: createUndo(actionTypes),
});
