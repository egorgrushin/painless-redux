import { Dictionary } from '../../system-types';
import { EntityActions } from '../actions';
import { EntityActionTypes, EntityAddListOptions } from '../types';
import { isNil, keyBy } from 'lodash';
import { merge } from '../../utils';
import { createChangeReducer } from '../../shared/change/reducer';


const addList = <T>(
    state: Dictionary<T>,
    data: T[],
    options?: EntityAddListOptions,
): Dictionary<T> => {
    const newEntities = keyBy(data, 'id');
    if (options?.merge) {
        return merge(state, newEntities);
    }
    return { ...state, ...newEntities };
};

export const createDictionaryReducer = <T>(
    types: EntityActionTypes,
) => {
    const changeReducer = createChangeReducer(types);
    return (
        state: Dictionary<T> = {},
        action: EntityActions,
    ): Dictionary<T> => {
        switch (action.type) {
            case types.ADD: {
                const entity = action.payload.entity;
                return addList(state, [entity], action.options);
            }
            case types.ADD_LIST: {
                const entities = action.payload.entities;
                return addList(state, entities, action.options);
            }
            case types.REMOVE: {
                const id = action.payload.id;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [id]: deleted, ...rest } = state;
                return rest;
            }
            case types.CHANGE: {
                const { id, patch } = action.payload;
                if (isNil(id)) return state;
                let existEntity: any = state[id];
                if (isNil(existEntity)) {
                    if (!action.options.ifNotExist) return state;
                    existEntity = { id };
                }
                return {
                    ...state,
                    [id]: action.options.merge ? changeReducer(existEntity, action) : patch,
                };
            }
            default:
                return state;
        }
    }
};
