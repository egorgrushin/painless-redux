import {
    EntityAddListOptions,
    EntityAddOptions,
    EntityRemoveListOptions,
    EntityRemoveOptions,
    EntitySetLoadingStateOptions,
    IdPatch,
    IdPatchRequest,
} from '../../types';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { EntityActions } from '../../actions';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';
import { AffectLoadingStateFactory } from '../../..';

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
        patch: PatchRequest<T>,
        options?: ChangeOptions,
    ): EntityActions;

    changeList(
        patches: IdPatchRequest<T>[],
        options?: ChangeOptions,
    ): EntityActions;

    changeListWithId(
        patches: IdPatchRequest<T>[],
        changeId: string,
        options?: ChangeOptions,
    ): EntityActions;

    changeWithId(
        id: Id,
        patch: PatchRequest<T>,
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

    resolveChangeList(
        patches: IdPatch<T>[],
        changeId: string,
        success: boolean,
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

    restoreRemovedList(
        ids: Id[],
    ): EntityActions;

    remove(
        id: Id,
        options?: EntityRemoveOptions,
    ): EntityActions;

    removeList(
        ids: Id[],
        options?: EntityRemoveListOptions,
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

    setLoadingStateByIds(
        ids: Id[],
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
    ): AffectLoadingStateFactory;

    affectLoadingStateById(
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ): AffectLoadingStateFactory;

    affectLoadingStateByConfigOrId(
        config?: unknown,
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ): AffectLoadingStateFactory;
}
