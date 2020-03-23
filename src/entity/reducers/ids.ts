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
        case types.RESOLVE_REMOVE: {
            const { payload: { success, id } } = action;
            if (!success) return state;
            return state.filter(existId => existId !== id);
        }
        default:
            return state;
    }
};
