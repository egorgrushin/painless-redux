import { Dispatcher } from '../../../dispatcher/types';
import {
    EntityActionTypes,
    EntityAddListOptions,
    EntityAddOptions,
    EntityInternalAddListOptions,
    EntityInternalAddOptions,
    EntityInternalSetLoadingStateOptions,
    EntityRemoveListOptions,
    EntityRemoveOptions,
    EntitySchema,
    EntitySetLoadingStateOptions,
    EntityType,
    IdPatch,
    IdPatchRequest,
} from '../../types';
import { EntityActions } from '../../actions';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { DispatchEntityMethods } from './types';
import { isNil } from 'lodash';
import { affectLoadingStateFactory } from '../../../affect-loading-state/affect-loading-state';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';
import { normalizePatch } from '../../../shared/change/utils';
import { SelectEntityMethods } from '../select/types';
import { AffectLoadingStateFactory } from '../../..';

export const createDispatchEntityMethods = <T>(
    dispatcher: Dispatcher<EntityActionTypes, EntityActions>,
    idResolver: (data: T) => EntityType<T>,
    selectMethods: SelectEntityMethods<T>,
    schema: EntitySchema<T>,
): DispatchEntityMethods<T> => {

    const add = (
        entity: T,
        config?: unknown,
        options?: EntityAddOptions,
    ) => {
        entity = idResolver(entity);
        const internalOptions: EntityInternalAddOptions = {
            ...options,
            maxPagesCount: schema.maxPagesCount,
        };
        return dispatcher.createAndDispatch('ADD', [entity, config, undefined], internalOptions);
    };

    const addWithId = (
        entity: T,
        tempId: string,
        config?: unknown,
        options?: EntityAddOptions,
    ) => {
        const internalOptions: EntityInternalAddOptions = {
            ...options,
            maxPagesCount: schema.maxPagesCount,
        };
        return dispatcher.createAndDispatch('ADD', [entity, config, tempId], internalOptions);
    };

    const resolveAdd = (
        result: T,
        success: boolean,
        tempId: string,
        config?: unknown,
        options?: EntityAddOptions,
    ) => {
        return dispatcher.createAndDispatch('RESOLVE_ADD', [result, success, tempId, config], options);
    };

    const addList = (
        entities: T[],
        config?: unknown,
        isReplace: boolean = false,
        hasMore: boolean = false,
        options?: EntityAddListOptions,
    ) => {
        const internalOptions: EntityInternalAddListOptions = {
            ...options,
            maxPagesCount: schema.maxPagesCount,
        };
        entities = entities.map((entity) => idResolver(entity));
        return dispatcher.createAndDispatch('ADD_LIST', [entities, config, isReplace, hasMore], internalOptions);
    };

    const changeWithId = (
        id: Id,
        patch: PatchRequest<T>,
        changeId: string | undefined,
        options?: ChangeOptions,
    ) => {
        const normalizedPatch = normalizePatch(patch, selectMethods.getById$(id));
        return dispatcher.createAndDispatch('CHANGE', [id, normalizedPatch, changeId], options);
    };

    const change = (
        id: Id,
        patch: PatchRequest<T>,
        options?: ChangeOptions,
    ) => {
        return changeWithId(id, patch, undefined, options);
    };

    const changeListWithId = (
        patches: IdPatchRequest<T>[],
        changeId: string | undefined,
        options?: ChangeOptions,
    ) => {
        const normalizedPatches: IdPatch<T>[] = patches.map((patch) => ({
            ...patch,
            patch: normalizePatch(patch.patch, selectMethods.getById$(patch.id)),
        }));
        return dispatcher.createAndDispatch('CHANGE_LIST', [normalizedPatches, changeId], options);
    };

    const changeList = (
        patches: IdPatchRequest<T>[],
        options?: ChangeOptions,
    ) => {
        return changeListWithId(patches, undefined, options);
    };

    const resolveChange = (
        id: Id,
        changeId: Id,
        success: boolean,
        remotePatch: DeepPartial<T>,
        options?: ChangeOptions,
    ) => {
        return dispatcher.createAndDispatch('RESOLVE_CHANGE', [id, changeId, success, remotePatch], options);
    };

    const resolveChangeList = (
        patches: IdPatch<T>[],
        changeId: string,
        success: boolean,
        options?: ChangeOptions,
    ) => {
        return dispatcher.createAndDispatch('RESOLVE_CHANGE_LIST', [patches, changeId, success], options);
    };

    const remove = (
        id: Id,
        options?: EntityRemoveOptions,
    ) => {
        return dispatcher.createAndDispatch('REMOVE', [id], options);
    };

    const removeList = (
        ids: Id[],
        options?: EntityRemoveListOptions,
    ) => {
        return dispatcher.createAndDispatch('REMOVE_LIST', [ids], options);
    };

    const restoreRemovedList = (
        ids: Id[],
    ) => {
        return dispatcher.createAndDispatch('RESTORE_REMOVED_LIST', [ids]);
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

    const setLoadingState = (
        state: LoadingState,
        config?: unknown,
        options?: EntitySetLoadingStateOptions,
    ) => {
        const internalOptions: EntityInternalSetLoadingStateOptions = {
            ...options,
            maxPagesCount: schema.maxPagesCount,
        };
        return dispatcher.createAndDispatch('SET_LOADING_STATE', [state, config, undefined, undefined], internalOptions);
    };

    const setLoadingStateById = (
        id: Id,
        state: LoadingState,
        options?: EntitySetLoadingStateOptions,
    ) => {
        const internalOptions: EntityInternalSetLoadingStateOptions = {
            ...options,
            maxPagesCount: schema.maxPagesCount,
        };
        return dispatcher.createAndDispatch('SET_LOADING_STATE', [state, undefined, id, undefined], internalOptions);
    };

    const setLoadingStateForKey = (
        id: Id,
        key: string,
        state: LoadingState,
        options?: EntitySetLoadingStateOptions,
    ) => {
        const internalOptions: EntityInternalSetLoadingStateOptions = {
            ...options,
            maxPagesCount: schema.maxPagesCount,
        };
        return dispatcher.createAndDispatch('SET_LOADING_STATE', [state, undefined, id, key], internalOptions);
    };

    const setLoadingStateByIds = (
        ids: Id[],
        state: LoadingState,
        options?: EntitySetLoadingStateOptions,
    ) => {
        const internalOptions: EntityInternalSetLoadingStateOptions = {
            ...options,
            maxPagesCount: schema.maxPagesCount,
        };
        return dispatcher.createAndDispatch('SET_LOADING_STATES', [state, ids], internalOptions);
    };

    const clear = (config: unknown) => {
        return dispatcher.createAndDispatch('CLEAR', [config]);
    };
    const clearAll = () => {
        return dispatcher.createAndDispatch('CLEAR_ALL', []);
    };

    const setLoadingStateBus = (
        state: LoadingState,
        id?: Id,
        config?: unknown,
        key?: string,
    ) => {
        if (!isNil(id)) {
            if (!isNil(key)) {
                return setLoadingStateForKey(id, key, state);
            } else {
                return setLoadingStateById(id, state);
            }
        } else {
            if (state.error) {
                console.error(state.error);
            }
            return setLoadingState(state, config);
        }
    };

    const affectLoadingState = (
        config?: unknown,
        key?: string,
        rethrow?: boolean,
    ) => {
        const setter = (state: LoadingState) => {
            setLoadingStateBus(state, undefined, config, key);
        };
        return affectLoadingStateFactory(setter, rethrow);
    };

    const affectLoadingStateById = (
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ) => {
        const setter = (state: LoadingState) => {
            setLoadingStateBus(state, id, undefined, key);
        };
        return affectLoadingStateFactory(setter, rethrow);
    };

    const affectLoadingStateByConfigOrId = (
        config?: unknown,
        id?: Id,
        key?: string,
        rethrow?: boolean,
    ): AffectLoadingStateFactory => {
        const setter = (state: LoadingState) => {
            setLoadingStateBus(state, id, config, key);
        };
        return affectLoadingStateFactory(setter, rethrow);
    };

    const batch = (
        actions: EntityActions[],
    ) => {
        return dispatcher.createAndDispatch('BATCH', [actions]);
    };

    return {
        add,
        addWithId,
        addList,
        change,
        changeList,
        changeListWithId,
        changeWithId,
        resolveChange,
        resolveChangeList,
        resolveAdd,
        remove,
        removeList,
        restoreRemovedList,
        resolveRemove,
        restoreRemoved,
        setLoadingState,
        clear,
        clearAll,
        setLoadingStateBus,
        setLoadingStateById,
        setLoadingStateForKey,
        affectLoadingState,
        affectLoadingStateById,
        affectLoadingStateByConfigOrId,
        batch,
        setLoadingStateByIds,
    };
};
