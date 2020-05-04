import { getHash } from './utils';
import {
    EntityActionTypes,
    EntityAddOptions,
    EntityInternalAddListOptions,
    EntityInternalAddOptions,
    EntityInternalSetLoadingStateOptions,
    EntityRemoveOptions,
    EntityType,
    IdPatch,
} from './types';
import { DeepPartial, Id, LoadingState } from '../system-types';
import { typedDefaultsDeep } from '../utils';
import * as loadingStateActions from '../shared/loading-state/actions';
import * as changeActions from '../shared/change/actions';
import { MAX_PAGES_COUNT } from './constants';
import { ChangeOptions } from '../shared/change/types';
import { SystemActions } from '../shared/system/actions';

export const createAddByHash = <T>(types: EntityActionTypes) => (
    entity: EntityType<T>,
    configHash: string,
    tempId?: string,
    options?: EntityInternalAddOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true, maxPagesCount: MAX_PAGES_COUNT });
    const payload = { entity, configHash, tempId };
    return { type: types.ADD, payload, options } as const;
};

export const createAdd = <T>(types: EntityActionTypes) => (
    entity: EntityType<T>,
    config?: unknown,
    tempId?: string,
    options?: EntityInternalAddOptions,
) => {
    const configHash = getHash(config);
    options = typedDefaultsDeep(options, { maxPagesCount: MAX_PAGES_COUNT });
    tempId = options.optimistic ? tempId : undefined;
    entity = options.optimistic ? { ...entity, id: tempId as string } : entity;
    return createAddByHash(types)(entity, configHash, tempId, options);
};

export const createResolveAdd = <T>(types: EntityActionTypes) => (
    result: EntityType<T>,
    success: boolean,
    tempId: string,
    config?: unknown,
    options?: EntityAddOptions,
) => {
    const configHash = getHash(config);
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { result, configHash, tempId, success };
    return { type: types.RESOLVE_ADD, payload, options } as const;
};

export const createAddList = <T>(types: EntityActionTypes) => (
    entities: EntityType<T>[],
    config?: unknown,
    isReplace: boolean = false,
    hasMore: boolean = false,
    options?: EntityInternalAddListOptions,
) => {
    const configHash = getHash(config);
    options = typedDefaultsDeep(options, { merge: true, maxPagesCount: MAX_PAGES_COUNT });
    const payload = { entities, configHash, isReplace, hasMore };
    return { type: types.ADD_LIST, payload, options } as const;
};

export const createRemove = (types: EntityActionTypes) => (
    id: Id,
    options?: EntityRemoveOptions,
) => {
    options = typedDefaultsDeep(options);
    const payload = { id };
    return { type: types.REMOVE, payload, options } as const;
};

export const createSetLoadingState = (types: EntityActionTypes) => (
    state: LoadingState,
    config?: unknown,
    id?: Id,
    key?: string,
    options?: EntityInternalSetLoadingStateOptions,
) => {
    const actionCreator = loadingStateActions.createSetLoadingState(types);
    const action = actionCreator(state, key, options);
    const configHash = getHash(config);
    return {
        ...action,
        payload: { ...action.payload, configHash, id },
        options: { ...action.options, maxPagesCount: options?.maxPagesCount ?? MAX_PAGES_COUNT },
    } as const;
};

export const createSetLoadingStates = (types: EntityActionTypes) => (
    state: LoadingState,
    ids: Id[],
    options?: EntityInternalSetLoadingStateOptions,
) => {
    return {
        type: types.SET_LOADING_STATES,
        payload: { state, ids },
        options: { maxPagesCount: options?.maxPagesCount ?? MAX_PAGES_COUNT },
    } as const;
};

export const createChange = <T>(types: EntityActionTypes) => (
    id: Id,
    patch: DeepPartial<T>,
    changeId?: string,
    options?: ChangeOptions,
) => {
    const actionCreator = changeActions.createChange(types);
    const action = actionCreator(patch, changeId, options);
    return {
        ...action,
        type: types.CHANGE,
        payload: { ...action.payload, id },
    } as const;
};

export const createChangeList = <T>(types: EntityActionTypes) => (
    patches: IdPatch<T>[],
    changeId?: string,
    options?: ChangeOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    return {
        type: types.CHANGE_LIST,
        payload: { patches, changeId },
        options,
    } as const;
};

export const createResolveChange = <T>(types: EntityActionTypes) => (
    id: Id,
    changeId: string,
    success: boolean,
    remotePatch?: DeepPartial<T>,
    options?: ChangeOptions,
) => {
    const actionCreator = changeActions.createResolveChange(types);
    const action = actionCreator(changeId, success, remotePatch, options);
    return {
        ...action,
        type: types.RESOLVE_CHANGE,
        payload: { ...action.payload, id },
    } as const;
};

export const createResolveChangeList = <T>(types: EntityActionTypes) => (
    patches: IdPatch<T>[],
    changeId: string,
    success: boolean,
    options?: ChangeOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    return {
        type: types.RESOLVE_CHANGE_LIST,
        payload: { patches, changeId, success },
        options,
    } as const;
};

export const createResolveRemove = <T>(types: EntityActionTypes) => (
    id: Id,
    success: boolean,
    options?: EntityRemoveOptions,
) => {
    options = typedDefaultsDeep(options);
    return { type: types.RESOLVE_REMOVE, payload: { id, success }, options } as const;
};

export const createRestoreRemoved = <T>(types: EntityActionTypes) => (
    id: Id,
) => {
    return { type: types.RESTORE_REMOVED, payload: { id } } as const;
};

export const createClear = (types: EntityActionTypes) => (config: unknown) => {
    const configHash = getHash(config);
    return { type: types.CLEAR, payload: { configHash } } as const;
};

export const createClearAll = (types: EntityActionTypes) => () => {
    return { type: types.CLEAR_ALL } as const;
};

type SelfActionCreators = ReturnType<typeof createAdd>
    | ReturnType<typeof createResolveAdd>
    | ReturnType<typeof createAddList>
    | ReturnType<typeof createRemove>
    | ReturnType<typeof createSetLoadingState>
    | ReturnType<typeof createChange>
    | ReturnType<typeof createResolveChange>
    | ReturnType<typeof createResolveRemove>
    | ReturnType<typeof createRestoreRemoved>
    | ReturnType<typeof createClear>
    | ReturnType<typeof createClearAll>
    | ReturnType<typeof createChangeList>
    | ReturnType<typeof createSetLoadingStates>
    | ReturnType<typeof createResolveChangeList>

export type EntityActions = ReturnType<SelfActionCreators> | SystemActions;

