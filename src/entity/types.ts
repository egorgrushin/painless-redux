import { Observable } from 'rxjs';
import { Selector } from 'reselect';
import { DeepPartial, Dictionary, HashFn, Id, IdFn, LoadingState } from '../system-types';
import { ChangeableState, PatchRequest } from '../shared/change/types';
import {
    LoadingStateActionTypes,
    LoadingStateSelector,
    LoadingStateSelectors,
    LoadingStateSetOptions,
    LoadingStateState,
} from '../shared/loading-state/types';
import { SelectEntityMethods } from './methods/select/types';
import { DispatchEntityMethods } from './methods/dispatch/types';
import { MixedEntityMethods } from './methods/mixed/types';
import { SystemActionTypes } from '../shared/system/types';
import { EntityActionCreators } from './action-creators.types';
import { RequestOptions } from '../shared/types';

export type EntityType<T> = T;

export type IdResolver<T> = (data: T, forceId?: Id) => Id;

export interface EntitySchema<T> {
    name: string;
    hashFn: HashFn;
    pageSize: number;
    maxPagesCount: number;
    id: IdFn<T>;
}

export interface EntityLoadOptions extends EntityInsertOptions, RequestOptions {
}

export interface EntityGetOptions extends EntityAddOptions {
}

export interface EntityGetListOptions extends EntityLoadListOptions {
}

export interface EntityLoadListOptions extends EntityAddListOptions, RequestOptions {
    pageSize?: number;
}

export interface EntityAddOptions extends EntityOptimisticOptions, EntityInsertOptions, RequestOptions {
}

interface EntityInternalOptions {
    maxPagesCount?: number;
}

export interface EntityInternalAddOptions extends EntityAddOptions, EntityInternalOptions {
}

export interface EntityInternalAddListOptions extends EntityAddListOptions, EntityInternalOptions {
}

export interface EntityOptimisticOptions {
    optimistic?: boolean;
}

export interface EntityRemoveOptions extends EntityOptimisticOptions, RequestOptions {
    safe?: boolean;
}

export interface EntityRemoveListOptions extends EntityOptimisticOptions, RequestOptions {
    safe?: boolean;
}

export interface EntitySetLoadingStateOptions extends LoadingStateSetOptions {
}

export interface EntityInternalSetLoadingStateOptions extends EntitySetLoadingStateOptions, EntityInternalOptions {
}

export interface EntityInsertOptions {
    pasteIndex?: number;
    merge?: boolean;
    single?: boolean;
}

export interface EntityAddListOptions extends EntityInsertOptions {
}

export interface Pagination {
    index: number;
    size: number;
    from: number;
    to: number;
}

export interface ResponseArray<T, TPageMetadata> {
    data: T[];
    hasMore?: boolean;
    metadata?: TPageMetadata;
}

export interface PaginatedResponse<T, TPageMetadata> extends Pagination {
    response: ResponseArray<T, TPageMetadata>;
}

export type Response$Factory<T, TPageMetadata> = (pagination: Pagination) => Observable<ResponseArray<T, TPageMetadata>>;

export interface Page<TPageMetadata> {
    ids: Id[] | undefined;
    order?: number;
    hasMore?: boolean;
    loadingState?: LoadingState;
    metadata?: TPageMetadata;
}

export interface IdPatchRequest<T> {
    id: Id;
    patch: PatchRequest<T>;
}

export interface IdPatch<T> {
    id: Id;
    patch: DeepPartial<T>;
}

export interface EntityInstanceState<T> extends ChangeableState<EntityType<T>> {
    removed?: boolean;
}

export interface EntityState<T, TPageMetadata> extends LoadingStateState {
    ids: Id[];
    dictionary: Dictionary<EntityInstanceState<T>>;
    pages: Dictionary<Page<TPageMetadata>>;
    loadingStates: Dictionary<LoadingState>;
}

export type IdsSelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, Id[] | undefined>;
export type DictionarySelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, Dictionary<EntityInstanceState<T>>>;
export type PagesSelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, Dictionary<Page<TPageMetadata>>>;
export type PagesListSelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, Page<TPageMetadata>[]>;
export type PageSelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, Page<TPageMetadata> | undefined>;
export type LoadingStatesSelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, Dictionary<LoadingState>>;
export type ActualSelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, T | undefined>;
export type ListSelector<T, TPageMetadata> = Selector<EntityState<T, TPageMetadata>, T[] | undefined>;

export interface BaseEntitySelectors<T, TPageMetadata> extends LoadingStateSelectors<EntityState<T, TPageMetadata>> {
    ids: IdsSelector<T, TPageMetadata>;
    dictionary: DictionarySelector<T, TPageMetadata>;
    pages: PagesSelector<T, TPageMetadata>;
    loadingStates: LoadingStatesSelector<T, TPageMetadata>;
    createLoadingStateById: (id: Id) => LoadingStateSelector<EntityState<T, TPageMetadata>>;
    createLoadingStateByIds: (ids: Id[]) => LoadingStateSelector<EntityState<T, TPageMetadata>>;
}

export interface EntitySelectors<T, TPageMetadata> extends BaseEntitySelectors<T, TPageMetadata> {
    createActual: (id: Id) => ActualSelector<T, TPageMetadata>;
    createPage: (config: unknown) => PageSelector<T, TPageMetadata>;
    createPageIds: (hash: string) => IdsSelector<T, TPageMetadata>;
    createPageLoadingState: (config: unknown) => LoadingStateSelector<EntityState<T, TPageMetadata>>;
    createPageIdsByConfig: (config: unknown) => IdsSelector<T, TPageMetadata>;
    createListSelectorByIds: (idsSelector: IdsSelector<T, TPageMetadata>) => ListSelector<T, TPageMetadata>;
    createPageListByConfig: (config: unknown) => ListSelector<T, TPageMetadata>;
    allPages: PagesListSelector<T, TPageMetadata>;
    all: ListSelector<T, TPageMetadata>;
}

export interface EntityActionTypes extends SystemActionTypes {
    ADD: 'ADD';
    RESOLVE_ADD: 'RESOLVE_ADD';
    ADD_LIST: 'ADD_LIST';
    SET_LOADING_STATE: LoadingStateActionTypes['SET_LOADING_STATE'];
    CHANGE: 'CHANGE';
    RESOLVE_CHANGE: 'RESOLVE_CHANGE';
    REMOVE: 'REMOVE';
    RESOLVE_REMOVE: 'RESOLVE_REMOVE';
    RESTORE_REMOVED: 'RESTORE_REMOVED';
    REMOVE_LIST: 'REMOVE_LIST';
    RESOLVE_REMOVE_LIST: 'RESOLVE_REMOVE_LIST';
    RESTORE_REMOVED_LIST: 'RESTORE_REMOVED_LIST';
    CLEAR: 'CLEAR';
    CLEAR_ALL: 'CLEAR_ALL';
    CHANGE_LIST: 'CHANGE_LIST';
    RESOLVE_CHANGE_LIST: 'RESOLVE_CHANGE_LIST';
    SET_LOADING_STATES: 'SET_LOADING_STATES';
}

export type PublicDispatchEntityMethods<T, TPageMetadata> = Omit<DispatchEntityMethods<T, TPageMetadata>,
    'changeWithId' | 'changeListWithId' | 'resolveChange' | 'resolveAdd' | 'resolveRemove' | 'resolveChangeList'>
export type PublicSelectEntityMethods<T, TPageMetadata> = Omit<SelectEntityMethods<T, TPageMetadata>, 'get$' | 'getDictionary$' | 'getById$'>

export interface Entity<T, TPageMetadata = void> extends PublicSelectEntityMethods<T, TPageMetadata>, PublicDispatchEntityMethods<T, TPageMetadata>, MixedEntityMethods<T, TPageMetadata> {
    actionCreators: EntityActionCreators<T, TPageMetadata>;
}

export type IdEntityPair<T> = { id: Id; entity: EntityType<T> };
export type IdInstancePair<T> = { id: Id; instance: EntityInstanceState<T> };
