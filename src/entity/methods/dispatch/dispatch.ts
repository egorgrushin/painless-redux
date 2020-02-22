import { Dispatcher } from '../../../dispatcher/types';
import {
    EntityActionTypes,
    EntityAddListOptions,
    EntityAddOptions,
    EntityRemoveOptions,
    EntitySetStateOptions,
} from '../../types';
import { EntityActions } from '../../actions';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { DispatchEntityMethods } from './types';
import { isNil } from 'lodash';
import { affectStateFactory } from '../../../affect-state/affect-state';
import { ChangeActionOptions } from '../../../shared/change/types';


export const createDispatchEntityMethods = <T>(
    dispatcher: Dispatcher<EntityActionTypes, EntityActions>,
    idResolver: (data: Partial<T>) => Partial<T>,
): DispatchEntityMethods<T> => {

    const add = (
        data: Partial<T>,
        config?: any,
        options?: EntityAddOptions,
    ) => {
        data = idResolver(data);
        return dispatcher.createAndDispatch('ADD', [data, config], options);
    };

    const addList = (
        data: Partial<T>[],
        config?: any,
        isReplace: boolean = false,
        hasMore: boolean = false,
        options?: EntityAddListOptions,
    ) => {
        return dispatcher.createAndDispatch('ADD_LIST', [data, config, isReplace, hasMore], options);
    };

    const change = (
        id: Id | Id[],
        patch: DeepPartial<T>,
        options?: ChangeActionOptions,
    ) => {
        return dispatcher.createAndDispatch('CHANGE', [id, patch], options);
    };

    const remove = (
        id: Id | Id[],
        options?: EntityRemoveOptions,
    ) => {
        return dispatcher.createAndDispatch('REMOVE', [id], options);
    };


    const setState = (
        state: LoadingState,
        config?: any,
        options?: EntitySetStateOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_STATE', [state, config], options);
    };

    const setStateById = (
        id: Id | Id[],
        state: LoadingState,
        options?: EntitySetStateOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_STATE', [state, undefined, id], options);
    };

    const setStateForKey = (
        id: Id | Id[],
        key: string,
        state: LoadingState,
        options?: EntitySetStateOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_STATE', [state, undefined, id, key], options);
    };

    const setStateBus = (
        state: LoadingState,
        id?: Id | Id[],
        config?: any,
        key?: string,
    ) => {
        if (!isNil(id)) {
            if (!isNil(key)) {
                setStateForKey(id, key, state);
            } else {
                setStateById(id, state);
            }
        } else {
            if (state.error) {
                console.error(state.error);
            }
            setState(state, config);
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
        id?: Id | Id[],
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
        id?: Id | Id[],
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
        addList,
        create: add,
        change,
        remove,
        setState,
        setStateById,
        setStateForKey,
        affectState,
        affectStateById,
        affectStateByConfigOrId,
    };
};
