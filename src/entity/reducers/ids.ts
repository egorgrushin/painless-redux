import { EntityActionTypes, EntityInsertOptions } from '../types';
import { EntityActions } from '../actions';
import { Id } from '../../system-types';
import { isNil } from 'lodash';

const getOnlyNewIds = (
    state: Id[],
    ids: Id[],
): Id[] => {
    return ids.filter((id: Id) => !state.includes(id));
};

const addIds = (
    state: Id[],
    ids: Id[],
    options?: EntityInsertOptions,
): Id[] => {
    const newIds = getOnlyNewIds(state, ids);
    if (options && !isNil(options.pasteIndex)) {
        const pre = state.slice(0, options.pasteIndex);
        const post = state.slice(options.pasteIndex);
        return pre.concat(newIds, post);
    }
    return state.concat(newIds);
};

export const createIdsReducer = (
    types: EntityActionTypes,
) => (
    state: Id[] = [],
    action: EntityActions,
): Id[] => {
    switch (action.type) {
        case types.ADD: {
            const entity = action.payload.entity;
            return addIds(state, [entity.id], action.options);
        }
        case types.CHANGE: {
            const index = state.indexOf(action.payload.id);
            if (index === -1) {
                if (!action.options.ifNotExist) return state;
                return addIds(state, [action.payload.id]);
            }
            return state;
        }
        case types.ADD_LIST: {
            const entities = action.payload.entities;
            const ids = entities.map((e) => e.id);
            return addIds(state, ids, action.options);
        }
        case types.REMOVE: {
            const { payload: { id }, options: { safe, optimistic } } = action;
            if (optimistic || safe) return state;
            return state.filter(existId => existId !== id);
        }
        case types.REMOVE_LIST: {
            const { payload: { ids }, options: { safe, optimistic } } = action;
            if (optimistic || safe) return state;
            return state.filter(existId => !ids.includes(existId));
        }
        case types.RESOLVE_REMOVE: {
            const { payload: { success, id }, options: { safe } } = action;
            if (!success || safe) return state;
            return state.filter(existId => existId !== id);
        }
        case types.RESOLVE_ADD: {
            const { payload: { success, result, tempId } } = action;
            if (!success) return state.filter((existId) => existId !== tempId);
            return state.map((id) => {
                if (id === tempId) return result.id;
                return id;
            });
        }
        case types.CLEAR_ALL: {
            return [];
        }
        default:
            return state;
    }
};
