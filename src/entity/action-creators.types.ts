import {
    EntityAddOptions,
    EntityInternalAddListOptions,
    EntityInternalAddOptions,
    EntityInternalSetLoadingStateOptions,
    EntityRemoveListOptions,
    EntityRemoveOptions,
    EntityType,
    IdPatch,
} from './types';
import { DeepPartial, Id, LoadingState } from '../system-types';
import { ChangeOptions } from '../shared/change/types';

// this types for public use
export interface EntityActionCreators<T> {
    ADD_LIST: (
        entities: EntityType<T>[],
        config?: unknown,
        isReplace?: boolean,
        hasMore?: boolean,
        options?: EntityInternalAddListOptions,
    ) => { payload: { entities: EntityType<T>[]; isReplace: boolean; hasMore: boolean; configHash: string }; options: EntityInternalAddListOptions; type: 'ADD_LIST' };
    RESTORE_REMOVED: (id: Id) => { payload: { id: Id }; type: 'RESTORE_REMOVED' };
    ADD: (
        entity: EntityType<T>,
        config?: unknown,
        tempId?: string,
        options?: EntityInternalAddOptions,
    ) => { payload: { configHash: string; tempId: string | undefined; entity: { id: Id } }; options: EntityInternalAddOptions; type: 'ADD' };
    RESOLVE_ADD: (
        result: EntityType<T>,
        success: boolean,
        tempId: string,
        config?: unknown,
        options?: EntityAddOptions,
    ) => { payload: { result: EntityType<T>; success: boolean; configHash: string; tempId: string }; options: EntityAddOptions; type: 'RESOLVE_ADD' };
    CLEAR_ALL: () => { type: 'CLEAR_ALL' };
    RESOLVE_REMOVE: (
        id: Id,
        success: boolean,
        options?: EntityRemoveOptions,
    ) => { payload: { success: boolean; id: Id }; options: EntityRemoveOptions; type: 'RESOLVE_REMOVE' };
    REMOVE: (
        id: Id,
        options?: EntityRemoveOptions,
    ) => { payload: { id: Id }; options: EntityRemoveOptions; type: 'REMOVE' };
    REMOVE_LIST: (
        ids: Id[],
        options?: EntityRemoveOptions,
    ) => { payload: { ids: Id[] }; options: EntityRemoveListOptions; type: 'REMOVE_LIST' };
    RESOLVE_REMOVE_LIST: (
        ids: Id[],
        success: boolean,
        options?: EntityRemoveOptions,
    ) => { payload: { success: boolean; ids: Id[] }; options: EntityRemoveListOptions; type: 'RESOLVE_REMOVE_LIST' };
    RESTORE_REMOVED_LIST: (
        ids: Id[],
    ) => { payload: { ids: Id[] }; type: 'RESTORE_REMOVED_LIST' };
    CHANGE: (
        id: Id,
        patch: DeepPartial<T>,
        changeId?: string,
        options?: ChangeOptions,
    ) => { payload: { patch: DeepPartial<unknown>; changeId: string | undefined; id: Id }; readonly options: ChangeOptions; type: 'CHANGE' };
    CHANGE_LIST: (
        patches: IdPatch<T>[],
        changeId?: string,
        options?: ChangeOptions,
    ) => { payload: { patches: IdPatch<T>[]; changeId: string | undefined }; readonly options: ChangeOptions; type: 'CHANGE_LIST' };
    BATCH: (actions: T[]) => { payload: { actions: T[] }; type: 'BATCH' };
    SET_LOADING_STATE: (
        state: LoadingState,
        config?: unknown,
        id?: Id,
        key?: string,
        options?: EntityInternalSetLoadingStateOptions,
    ) => { payload: { configHash: string; state: LoadingState<string>; id: Id | undefined; key: string | undefined }; options: { maxPagesCount: number }; readonly type: 'SET_LOADING_STATE' };
    SET_LOADING_STATES: (
        state: LoadingState,
        ids: Id[],
        options?: EntityInternalSetLoadingStateOptions,
    ) => { payload: { ids: Id[]; state: LoadingState<string> }; options: { maxPagesCount: number }; readonly type: 'SET_LOADING_STATES' };
    RESOLVE_CHANGE: (
        id: Id,
        changeId: string,
        success: boolean,
        remotePatch?: DeepPartial<T>,
        options?: ChangeOptions,
    ) => { payload: { success: boolean; remotePatch: DeepPartial<unknown> | undefined; changeId: string; id: Id }; readonly options: ChangeOptions; type: 'RESOLVE_CHANGE' };
    RESOLVE_CHANGE_LIST: (
        patches: IdPatch<T>[],
        changeId: string,
        success: boolean,
        options?: ChangeOptions,
    ) => { payload: { patches: IdPatch<T>[]; changeId: string; success: boolean }; readonly options: ChangeOptions; type: 'RESOLVE_CHANGE_LIST' };
    CLEAR: (config: unknown) => { payload: { configHash: string }; type: 'CLEAR' };
}
