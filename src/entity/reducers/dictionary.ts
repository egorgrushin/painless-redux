import { Dictionary } from '../../system-types';
import { createAddByHash, createResolveChange, EntityActions } from '../actions';
import { EntityActionTypes, EntityInstanceState, EntityType, IdInstancePair } from '../types';
import { createInstanceReducer } from './instance';

const addInstances = <T>(
    state: Dictionary<EntityInstanceState<T>>,
    instancePairs: IdInstancePair<T>[],
): Dictionary<EntityInstanceState<T>> => {
    const newInstances = instancePairs.reduce((memo: Dictionary<EntityInstanceState<T>>, instancePair) => {
        memo[instancePair.id] = instancePair.instance;
        return memo;
    }, {});
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
                const id = action.payload.idEntityPair.id;
                const instanceState = state[id];
                const instance = instanceReducer(instanceState, action);
                if (!instance) return state;
                const instancePairs: IdInstancePair<T>[] = [{ id, instance }];
                return addInstances(state, instancePairs);
            }
            case types.RESOLVE_ADD: {
                const {
                    payload: { idEntityPair, success, tempId },
                    options,
                } = action;
                const optimisticCreated = state[tempId];
                if (!optimisticCreated) return state;
                const { [tempId]: deleted, ...rest } = state;
                if (!success) return rest;
                const resolveChange = createResolveChange(types);
                const resolveChangeAction = resolveChange(
                    tempId,
                    tempId,
                    true,
                    idEntityPair.entity as EntityType<T>,
                    options,
                );
                const instance = instanceReducer(optimisticCreated, resolveChangeAction);
                if (!instance) return state;
                const instancePairs: IdInstancePair<T>[] = [{ id: idEntityPair.id, instance }];
                return addInstances(state, instancePairs);
            }
            case types.ADD_LIST: {
                const { payload: { idEntityPairs, configHash }, options } = action;
                const add = createAddByHash(types);
                const instancePairs: IdInstancePair<T>[] = idEntityPairs.map((idEntityPair) => {
                    const action = add(idEntityPair, configHash, undefined, options);
                    const instanceState = state[idEntityPair.id];
                    return {
                        id: idEntityPair.id,
                        instance: instanceReducer(instanceState, action) as EntityInstanceState<T>,
                    };
                });
                return addInstances(state, instancePairs);
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
            case types.REMOVE_LIST:
            case types.RESOLVE_REMOVE_LIST:
            case types.RESTORE_REMOVED_LIST: {
                const { payload: { ids } } = action;
                return ids.reduce((memo, id) => {
                    const instanceState = state[id];
                    const instance = instanceReducer(instanceState, action);
                    if (instance) {
                        memo[id] = instance;
                    } else {
                        delete memo[id];
                    }
                    return memo;
                }, { ...state });
            }
            case types.CLEAR_ALL: {
                return {};
            }
            default:
                return state;
        }
    };
};
