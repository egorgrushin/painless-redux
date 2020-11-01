import { Observable } from 'rxjs';
import { Selector } from 'reselect';
import { DeepPartial, Dictionary, HashFn, Id, LoadingState } from '../system-types';
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

export type EntityType<T> = T & { id: Id };

export interface EntitySchema<T> {
    name: string;
    hashFn: HashFn;
    pageSize: number;
    maxPagesCount: number;

    id?(data: T): Id;
}

export interface EntityLoadOptions extends EntityInsertOptions, RequestOptions {}

export interface EntityGetOptions extends EntityAddOptions {}

export interface EntityGetListOptions extends EntityLoadListOptions {
}

export interface EntityLoadListOptions extends EntityAddListOptions, RequestOptions {
    pageSize?: number;
}

export interface EntityAddOptions extends EntityOptimisticOptions, EntityInsertOptions, RequestOptions {}

interface EntityInternalOptions {
    maxPagesCount?: number;
}

export interface EntityInternalAddOptions extends EntityAddOptions, EntityInternalOptions {}

export interface EntityInternalAddListOptions extends EntityAddListOptions, EntityInternalOptions {}

export interface EntityOptimisticOptions {
    optimistic?: boolean;
}

export interface EntityRemoveOptions extends EntityOptimisticOptions, RequestOptions {
    safe?: boolean;
}

export interface EntityRemoveListOptions extends EntityOptimisticOptions, RequestOptions {
    safe?: boolean;
}

export interface EntitySetLoadingStateOptions extends LoadingStateSetOptions {}

export interface EntityInternalSetLoadingStateOptions extends EntitySetLoadingStateOptions, EntityInternalOptions {}

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

export interface ResponseArray<T> {
    data: T[];
    hasMore?: boolean;
}

export interface PaginatedResponse<T> extends Pagination {
    response: ResponseArray<T>;
}

export type Response$Factory<T> = (pagination: Pagination) => Observable<ResponseArray<T>>;

export interface Page {
    ids: Id[] | undefined;
    order?: number;
    hasMore?: boolean;
    loadingState?: LoadingState;
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

export interface EntityState<T> extends LoadingStateState {
    ids: Id[];
    dictionary: Dictionary<EntityInstanceState<T>>;
    pages: Dictionary<Page>;
    loadingStates: Dictionary<LoadingState>;
}

export type IdsSelector<T> = Selector<EntityState<T>, Id[] | undefined>;
export type DictionarySelector<T> = Selector<EntityState<T>, Dictionary<EntityInstanceState<T>>>;
export type PagesSelector<T> = Selector<EntityState<T>, Dictionary<Page>>;
export type PagesListSelector<T> = Selector<EntityState<T>, Page[]>;
export type PageSelector<T> = Selector<EntityState<T>, Page | undefined>;
export type LoadingStatesSelector<T> = Selector<EntityState<T>, Dictionary<LoadingState>>;
export type ActualSelector<T> = Selector<EntityState<T>, T | undefined>;
export type ListSelector<T> = Selector<EntityState<T>, T[] | undefined>;

export interface BaseEntitySelectors<T> extends LoadingStateSelectors<EntityState<T>> {
    ids: IdsSelector<T>;
    dictionary: DictionarySelector<T>;
    pages: PagesSelector<T>;
    loadingStates: LoadingStatesSelector<T>;
    createLoadingStateById: (id: Id) => LoadingStateSelector<EntityState<T>>;
    createLoadingStateByIds: (ids: Id[]) => LoadingStateSelector<EntityState<T>>;
}

export interface EntitySelectors<T> extends BaseEntitySelectors<T> {
    createActual: (id: Id) => ActualSelector<T>;
    createPage: (config: unknown) => PageSelector<T>;
    createPageIds: (hash: string) => IdsSelector<T>;
    createPageLoadingState: (config: unknown) => LoadingStateSelector<EntityState<T>>;
    createPageIdsByConfig: (config: unknown) => IdsSelector<T>;
    createListSelectorByIds: (idsSelector: IdsSelector<T>) => ListSelector<T>;
    createPageListByConfig: (config: unknown) => ListSelector<T>;
    allPages: PagesListSelector<T>;
    all: ListSelector<T>;
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
    RESTORE_REMOVED_LIST: 'RESTORE_REMOVED_LIST';
    CLEAR: 'CLEAR';
    CLEAR_ALL: 'CLEAR_ALL';
    CHANGE_LIST: 'CHANGE_LIST';
    RESOLVE_CHANGE_LIST: 'RESOLVE_CHANGE_LIST';
    SET_LOADING_STATES: 'SET_LOADING_STATES';
}

export type PublicDispatchEntityMethods<T> = Omit<DispatchEntityMethods<T>,
    'changeWithId' | 'changeListWithId' | 'resolveChange' | 'resolveAdd' | 'resolveRemove' | 'resolveChangeList'>
export type PublicSelectEntityMethods<T> = Omit<SelectEntityMethods<T>, 'get$' | 'getDictionary$' | 'getById$'>

export interface Entity<T> extends PublicSelectEntityMethods<T>, PublicDispatchEntityMethods<T>, MixedEntityMethods<T> {
    actionCreators: EntityActionCreators<T>;
}
