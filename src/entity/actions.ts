import { getHash } from './utils';
import {
    EntityActionTypes,
    EntityAddListOptions,
    EntityAddOptions,
    EntityChangeOptions,
    EntityRemoveOptions,
    EntitySetStateOptions,
    EntityType,
} from './types';
import { DeepPartial, Id, LoadingState } from '../system-types';
import { typedDefaultsDeep } from '../utils';
import * as loadingStateActions from '../shared/loading-state/actions';

export const createAddByHash = <T>(types: EntityActionTypes) => (
    entity: EntityType<T>,
    configHash: string,
    tempId?: string,
    options?: EntityAddOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { entity, configHash, tempId };
    return { type: types.ADD, payload, options } as const;
};

export const createAdd = <T>(types: EntityActionTypes) => (
    entity: EntityType<T>,
    config?: any,
    tempId?: string,
    options?: EntityAddOptions,
) => {
    const configHash = getHash(config);
    options = typedDefaultsDeep(options);
    tempId = options.optimistic ? tempId : undefined;
    entity = options.optimistic ? { ...entity, id: tempId as string } : entity;
    return createAddByHash(types)(entity, configHash, tempId, options);
};

export const createResolveAdd = <T>(types: EntityActionTypes) => (
    result: EntityType<T>,
    success: boolean,
    tempId: string,
    config?: any,
    options?: EntityAddOptions,
) => {
    const configHash = getHash(config);
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { result, configHash, tempId, success };
    return { type: types.RESOLVE_ADD, payload, options } as const;
};

export const createAddList = <T>(types: EntityActionTypes) => (
    entities: EntityType<T>[],
    config?: any,
    isReplace: boolean = false,
    hasMore: boolean = false,
    options?: EntityAddListOptions,
) => {
    const configHash = getHash(config);
    options = typedDefaultsDeep(options, { merge: true });
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

export const createSetState = (types: EntityActionTypes) => (
    state: LoadingState,
    config?: any,
    id?: Id,
    key?: string,
    options?: EntitySetStateOptions,
) => {
    const actionCreator = loadingStateActions.createSetState(types);
    const action = actionCreator(state, key, options);
    const configHash = getHash(config);
    return { ...action, payload: { ...action.payload, configHash, id } } as const;
};

export const createChange = <T>(types: EntityActionTypes) => (
    id: Id,
    patch: DeepPartial<T>,
    changeId?: string,
    options?: EntityChangeOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    return { type: types.CHANGE, payload: { patch, id, changeId }, options } as const;
};

export const createResolveChange = <T>(types: EntityActionTypes) => (
    id: Id,
    changeId: string,
    success: boolean,
    remotePatch?: DeepPartial<T>,
    options?: EntityChangeOptions,
) => {
    options = typedDefaultsDeep(options, { merge: true });
    return { type: types.RESOLVE_CHANGE, payload: { id, changeId, success, remotePatch }, options } as const;
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

type SelfActionCreators = ReturnType<typeof createAdd>
    | ReturnType<typeof createResolveAdd>
    | ReturnType<typeof createAddList>
    | ReturnType<typeof createRemove>
    | ReturnType<typeof createSetState>
    | ReturnType<typeof createChange>
    | ReturnType<typeof createResolveChange>
    | ReturnType<typeof createResolveRemove>
    | ReturnType<typeof createRestoreRemoved>

export type EntityActions = ReturnType<SelfActionCreators>;

