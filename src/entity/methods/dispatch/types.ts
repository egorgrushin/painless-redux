import {
    EntityAddListOptions,
    EntityAddOptions,
    EntityChangeOptions,
    EntityRemoveOptions,
    EntitySetStateOptions,
} from '../../types';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { EntityActions } from '../../actions';
import { Observable, OperatorFunction } from 'rxjs';

export interface DispatchEntityMethods<T> {
    add: (
        data: Partial<T>,
        config?: any,
        options?: EntityAddOptions,
    ) => EntityActions;
    addList: (
        data: Partial<T>[],
        config?: any,
        isReplace?: boolean,
        hasMore?: boolean,
        options?: EntityAddListOptions,
    ) => EntityActions;
    create: (
        data: Partial<T>,
        config?: any,
        options?: EntityAddOptions,
    ) => EntityActions;
    change: (
        id: Id | Id[],
        patch: DeepPartial<T>,
        options?: EntityChangeOptions,
    ) => EntityActions;
    remove: (
        id: Id | Id[],
        options?: EntityRemoveOptions,
    ) => EntityActions;
    setState: (
        state: LoadingState,
        config?: any,
        options?: EntitySetStateOptions,
    ) => EntityActions;
    setStateById: (
        id: Id | Id[],
        state: LoadingState,
        options?: EntitySetStateOptions,
    ) => EntityActions;
    setStateForKey: (
        id: Id | Id[],
        key: string,
        state: LoadingState,
        options?: EntitySetStateOptions,
    ) => EntityActions;
    affectState: (
        config?: any,
        key?: string,
        rethrow?: boolean,
    ) => (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;
    affectStateById: (
        id?: Id | Id[],
        key?: string,
        rethrow?: boolean,
    ) => (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;
    affectStateByConfigOrId: (
        config?: any,
        id?: Id | Id[],
        key?: string,
        rethrow?: boolean,
    ) => (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;
}
