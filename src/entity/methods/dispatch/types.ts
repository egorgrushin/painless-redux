import { EntityAddListOptions, EntityAddOptions, EntityRemoveOptions, EntitySetLoadingStateOptions } from '../../types';
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

    setLoadingState(
        state: LoadingState,
        config?: unknown,
        options?: EntitySetLoadingStateOptions,
    ): EntityActions;

    clear(config: unknown): EntityActions;

    clearAll(): EntityActions;

    setLoadingStateById(
        id: Id,
        state: LoadingState,
        options?: EntitySetLoadingStateOptions,
    ): EntityActions;

    setLoadingStateForKey(
        id: Id,
        key: string,
        state: LoadingState,
        options?: EntitySetLoadingStateOptions,
    ): EntityActions;

    setLoadingStateBus(
        state: LoadingState,
        id?: Id,
        config?: unknown,
        key?: string,
    ): EntityActions;

    batch(
        actions: EntityActions[],
    ): EntityActions;

    affectLoadingState(
        config?: unknown,
        key?: string,
        rethrow?: boolean,
    ): (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;

    affectLoadingStateById(
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ): (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;

    affectLoadingStateByConfigOrId(
        config?: unknown,
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ): (...pipes: Array<OperatorFunction<any, any> | Observable<T>>) => any;
}
