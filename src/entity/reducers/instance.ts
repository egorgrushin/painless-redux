import { EntityActionTypes, EntityInstanceState, EntityType } from '../types';
import { EntityActions } from '../actions';
import { createInstanceByChanges, getMergedChanges } from '../../shared/change/utils';
import { createChangeReducer } from '../../shared/change/reducer';
import { createChange } from '../../shared/change/actions';

export const createInstanceReducer = <T>(types: EntityActionTypes) => {
    const changeReducer = createChangeReducer(types);
    const createChangeAction = createChange<EntityType<T>>(types);
    return (
        state: EntityInstanceState<T> | undefined,
        action: EntityActions,
    ): EntityInstanceState<T> | undefined => {
        switch (action.type) {
            case types.ADD: {
                const {
                    options: { optimistic, merge },
                    payload: { entity, tempId },
                } = action;
                const instance = createInstanceByChanges(
                    state,
                    entity as EntityType<T>,
                    merge,
                    !optimistic,
                    tempId,
                );
                return getMergedChanges(instance, true);
            }
            case types.CHANGE: {
                const {
                    options,
                    payload: { id, patch, changeId },
                } = action;
                const { ifNotExist } = options;
                if (!ifNotExist && !state) return state;
                const patchWithId = { id, ...patch };
                const resultPatch = ifNotExist ? patchWithId : patch;
                const changeAction = createChangeAction(resultPatch, changeId, options);
                return changeReducer(state, changeAction) as EntityInstanceState<T>;
            }
            case types.RESOLVE_CHANGE: {
                return changeReducer(state, action) as EntityInstanceState<T>;
            }
            case types.REMOVE:
            case types.REMOVE_LIST: {
                if (!state) return state;
                const { options: { optimistic, safe } } = action;
                if (safe || optimistic) return { ...state, removed: true };
                return undefined;
            }
            case types.RESOLVE_REMOVE: {
                if (!state) return state;
                const {
                    payload: { success },
                    options: { safe },
                } = action;
                if (safe || state.removed === false) return state;
                if (success) return undefined;
                return { ...state, removed: false };
            }
            case types.RESTORE_REMOVED:
            case types.RESTORE_REMOVED_LIST: {
                if (!state) return state;
                return { ...state, removed: false };
            }
            default:
                return state;
        }
    };
};
