import { controlId, getHash } from './utils';
import {
    EntityActionTypes,
    EntityAddListOptions,
    EntityAddOptions,
    EntityRemoveOptions,
    EntitySetStateOptions,
} from './types';
import { Id, LoadingState } from '../system-types';
import * as changeActions from '../shared/change/actions';
import { typedDefaultsDeep } from '../utils';
import * as loadingStateActions from '../shared/loading-state/actions';
import { ChangeActionOptions } from '../shared/change/types';

export const createAdd = (types: EntityActionTypes) => (
    entity: any,
    config?: any,
    options?: EntityAddOptions,
) => {
    const configHash = getHash(config);
    controlId(entity);
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { entity, configHash };
    return { type: types.ADD, payload, options } as const;
};

export const createAddList = (types: EntityActionTypes) => (
    entities: any[],
    config?: any,
    isReplace: boolean = false,
    hasMore: boolean = false,
    options?: EntityAddListOptions,
) => {
    const configHash = getHash(config);
    entities = entities.map(e => controlId(e));
    options = typedDefaultsDeep(options, { merge: true });
    const payload = { entities, configHash, isReplace, hasMore };
    return { type: types.ADD_LIST, payload, options } as const;
};

export const createCreate = createAdd;

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
    const action = loadingStateActions.createSetState(types)(state, key, options);
    const configHash = getHash(config);
    return { ...action, payload: { ...action.payload, configHash, id } } as const;
};

export const createChange = (types: EntityActionTypes) => (
    id: Id,
    patch: any,
    options?: ChangeActionOptions,
) => {
    const action = changeActions.createChange(types)(patch, options);
    return { ...action, payload: { ...action.payload, id } } as const;
};

type SelfActionCreators = ReturnType<typeof createAdd>
    | ReturnType<typeof createAddList>
    | ReturnType<typeof createCreate>
    | ReturnType<typeof createRemove>
    | ReturnType<typeof createSetState>
    | ReturnType<typeof createChange>

export type EntityActions = ReturnType<SelfActionCreators>;

