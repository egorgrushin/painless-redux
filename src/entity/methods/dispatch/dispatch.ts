import { Dispatcher } from '../../../dispatcher/types';
import {
    EntityActionTypes,
    EntityAddListOptions,
    EntityAddOptions,
    EntityChangeOptions,
    EntityRemoveOptions,
    EntitySetStateOptions,
    EntityType,
} from '../../types';
import { EntityActions } from '../../actions';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { DispatchEntityMethods } from './types';
import { isNil } from 'lodash';
import { affectStateFactory } from '../../../affect-state/affect-state';
import { ChangeOptions } from '../../../shared/change/types';

export const createDispatchEntityMethods = <T>(
    dispatcher: Dispatcher<EntityActionTypes, EntityActions>,
    idResolver: (data: T) => EntityType<T>,
): DispatchEntityMethods<T> => {

    const add = (
        entity: T,
        config?: any,
        options?: EntityAddOptions,
    ) => {
        entity = idResolver(entity);
        return dispatcher.createAndDispatch('ADD', [entity, config], options);
    };

    const addWithId = (
        entity: T,
        tempId: string,
        config?: any,
        options?: EntityAddOptions,
    ) => {
        return dispatcher.createAndDispatch('ADD', [entity, config, tempId], options);
    };

    const resolveAdd = (
        result: T,
        success: boolean,
        tempId: string,
        config?: any,
        options?: EntityAddOptions,
    ) => {
        return dispatcher.createAndDispatch('RESOLVE_ADD', [result, success, tempId, config], options);
    };

    const addList = (
        entities: T[],
        config?: any,
        isReplace: boolean = false,
        hasMore: boolean = false,
        options?: EntityAddListOptions,
    ) => {
        entities = entities.map((entity) => idResolver(entity));
        return dispatcher.createAndDispatch('ADD_LIST', [entities, config, isReplace, hasMore], options);
    };

    const change = (
        id: Id,
        patch: DeepPartial<T>,
        options?: ChangeOptions,
    ) => {
        return dispatcher.createAndDispatch('CHANGE', [id, patch], options);
    };

    const changeWithId = (
        id: Id,
        patch: DeepPartial<T>,
        changeId: string,
        options?: EntityChangeOptions,
    ) => {
        return dispatcher.createAndDispatch('CHANGE', [id, patch, changeId], options);
    };

    const resolveChange = (
        id: Id,
        changeId: Id,
        success: boolean,
        remotePatch: DeepPartial<T>,
        options?: EntityChangeOptions,
    ) => {
        return dispatcher.createAndDispatch('RESOLVE_CHANGE', [id, changeId, success, remotePatch], options);
    };

    const remove = (
        id: Id,
        options?: EntityRemoveOptions,
    ) => {
        return dispatcher.createAndDispatch('REMOVE', [id], options);
    };

    const resolveRemove = (
        id: Id,
        success: boolean,
        options?: EntityRemoveOptions,
    ) => {
        return dispatcher.createAndDispatch('RESOLVE_REMOVE', [id, success], options);
    };

    const restoreRemoved = (
        id: Id,
    ) => {
        return dispatcher.createAndDispatch('RESTORE_REMOVED', [id]);
    };

    const setState = (
        state: LoadingState,
        config?: any,
        options?: EntitySetStateOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_STATE', [state, config], options);
    };

    const setStateById = (
        id: Id,
        state: LoadingState,
        options?: EntitySetStateOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_STATE', [state, undefined, id], options);
    };

    const setStateForKey = (
        id: Id,
        key: string,
        state: LoadingState,
        options?: EntitySetStateOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_STATE', [state, undefined, id, key], options);
    };

    const clear = (config: any) => {
        return dispatcher.createAndDispatch('CLEAR', [config]);
    };
    const clearAll = () => {
        return dispatcher.createAndDispatch('CLEAR_ALL', []);
    };

    const setStateBus = (
        state: LoadingState,
        id?: Id,
        config?: any,
        key?: string,
    ) => {
        if (!isNil(id)) {
            if (!isNil(key)) {
                return setStateForKey(id, key, state);
            } else {
                return setStateById(id, state);
            }
        } else {
            if (state.error) {
                console.error(state.error);
            }
            return setState(state, config);
        }
    };

    const affectState = (
        config?: any,
        key?: string,
        rethrow?: boolean,
    ) => {
        const setter = (state: LoadingState) => {
            setStateBus(state, undefined, config, key);
        };
        return affectStateFactory(setter, rethrow);
    };

    const affectStateById = (
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ) => {
        const setter = (state: LoadingState) => {
            setStateBus(state, id, undefined, key);
        };
        return affectStateFactory(setter, rethrow);
    };

    const affectStateByConfigOrId = (
        config?: any,
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ) => {
        const setter = (state: LoadingState) => {
            setStateBus(state, id, config, key);
        };
        return affectStateFactory(setter, rethrow);
    };

    return {
        add,
        addWithId,
        addList,
        change,
        changeWithId,
        resolveChange,
        resolveAdd,
        remove,
        resolveRemove,
        restoreRemoved,
        setState,
        clear,
        clearAll,
        setStateBus,
        setStateById,
        setStateForKey,
        affectState,
        affectStateById,
        affectStateByConfigOrId,
    };
};
