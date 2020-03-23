import { Dictionary } from '../../system-types';
import { createAddByHash, EntityActions } from '../actions';
import { EntityActionTypes, EntityInstanceState } from '../types';
import { keyBy } from 'lodash';
import { createInstanceReducer } from './instance';

const addInstances = <T>(
    state: Dictionary<EntityInstanceState<T>>,
    instances: EntityInstanceState<T>[],
): Dictionary<EntityInstanceState<T>> => {
    const newInstances = keyBy<EntityInstanceState<T>>(instances, 'actual.id');
    return { ...state, ...newInstances };
};

export const createDictionaryReducer = <T>(
    types: EntityActionTypes,
) => {
    const instanceReducer = createInstanceReducer<T>(types);
    return (
        state: Dictionary<EntityInstanceState<T>> = {},
        action: EntityActions,
    ): Dictionary<EntityInstanceState<T>> => {
        switch (action.type) {
            case types.ADD: {
                const entity = action.payload.entity;
                const instanceState = state[entity.id];
                const instance = instanceReducer(instanceState, action);
                if (!instance) return state;
                return addInstances(state, [instance]);
            }
            case types.ADD_LIST: {
                const { payload: { entities, configHash }, options } = action;
                const add = createAddByHash(types);
                const instances = entities.map((entity) => {
                    const action = add(entity, configHash, options);
                    const instanceState = state[entity.id];
                    return instanceReducer(instanceState, action) as EntityInstanceState<T>;
                });
                return addInstances(state, instances);
            }
            case types.CHANGE:
            case types.RESOLVE_CHANGE: {
                const { payload: { id }, options: { ifNotExist } } = action;
                const instanceState = state[id];
                if (instanceState === undefined && !ifNotExist) return state;
                const instance = instanceReducer(instanceState, action) as EntityInstanceState<T>;
                return { ...state, [id]: instance };
            }
            case types.REMOVE:
            case types.RESOLVE_REMOVE:
            case types.RESTORE_REMOVED: {
                const { payload: { id } } = action;
                const instanceState = state[id];
                const instance = instanceReducer(instanceState, action);
                if (instance) return { ...state, [id]: instance };
                const { [id]: deleted, ...rest } = state;
                return rest;
            }
            default:
                return state;
        }
    };
};
