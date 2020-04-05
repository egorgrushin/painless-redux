import { EntityAddListOptions, EntityAddOptions, EntityRemoveOptions, EntitySetStateOptions } from '../../types';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { EntityActions } from '../../actions';
import { Observable, OperatorFunction } from 'rxjs';
import { ChangeOptions } from '../../../shared/change/types';

export interface DispatchEntityMethods<T> {
    add(
        data: T,
        config?: unknown,
        options?: EntityAddOptions,
    ): EntityActions;

    addWithId(
        data: T,
        tempId: string,
        config?: unknown,
        options?: EntityAddOptions,
    ): EntityActions;

    resolveAdd(
        data: T | undefined,
        success: boolean,
        tempId: string,
        config?: unknown,
        options?: EntityAddOptions,
    ): EntityActions;

    addList(
        data: T[],
        config?: unknown,
        isReplace?: boolean,
        hasMore?: boolean,
        options?: EntityAddListOptions,
    ): EntityActions;

    change(
        id: Id,
        patch: DeepPartial<T>,
        options?: ChangeOptions,
    ): EntityActions;

    changeWithId(
        id: Id,
        patch: DeepPartial<T>,
        changeId: string,
        options?: ChangeOptions,
    ): EntityActions;

    resolveChange(
        id: Id,
        changeId: string,
        success: boolean,
        remotePatch?: DeepPartial<T>,
        options?: ChangeOptions,
    ): EntityActions;

    resolveRemove(
        id: Id,
        success: boolean,
        options?: EntityRemoveOptions,
    ): EntityActions;

    restoreRemoved(
        id: Id,
    ): EntityActions;

    remove(
        id: Id,
        options?: EntityRemoveOptions,
    ): EntityActions;

    setState(
        state: LoadingState,
        config?: unknown,
        options?: EntitySetStateOptions,
    ): EntityActions;

    clear(config: unknown): EntityActions;

    clearAll(): EntityActions;

    setStateById(
        id: Id,
        state: LoadingState,
        options?: EntitySetStateOptions,
    ): EntityActions;

    setStateForKey(
        id: Id,
        key: string,
        state: LoadingState,
        options?: EntitySetStateOptions,
    ): EntityActions;

    setStateBus(
        state: LoadingState,
        id?: Id,
        config?: unknown,
        key?: string,
    ): EntityActions;

    batch(
        actions: EntityActions[],
    ): EntityActions;

    affectState(
        config?: unknown,
        key?: string,
        rethrow?: boolean,
    ): (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;

    affectStateById(
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ): (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;

    affectStateByConfigOrId(
        config?: unknown,
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ): (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;
}
