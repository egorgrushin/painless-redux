import { Observable } from 'rxjs';
import { Selector } from 'reselect';
import { Dictionary, HashFn, Id, LoadingState } from '../system-types';
import { ChangeableState } from '../shared/change/types';
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
import { EntityActionCreators } from './action-creators';
import { SystemActionTypes } from '../shared/system/types';

export type EntityType<T> = T & { id: Id };

export interface EntitySchema<T> {
    name: string;
    hashFn: HashFn;
    pageSize: number;
    maxPagesCount: number;

    id?(data: T): Id;
}

export interface EntityLoadOptions {

}

export interface EntityGetOptions extends EntityLoadOptions, EntityAddOptions {

}

export interface EntityGetListOptions extends EntityLoadListOptions {
}

export interface EntityLoadListOptions extends EntityAddListOptions {
    pageSize?: number;
}

export interface EntityAddOptions extends EntityOptimisticOptions, EntityInsertOptions {}

interface EntityInternalOptions {
    maxPagesCount?: number;
}

export interface EntityInternalAddOptions extends EntityAddOptions, EntityInternalOptions {}

export interface EntityInternalAddListOptions extends EntityAddListOptions, EntityInternalOptions {}

export interface EntityOptimisticOptions {
    optimistic?: boolean;
}

export interface EntityRemoteOptions extends EntityOptimisticOptions {
    single?: boolean;
}

export interface EntityRemoveOptions extends EntityOptimisticOptions {
    safe?: boolean;
}

export interface EntitySetStateOptions extends LoadingStateSetOptions {}

export interface EntityInternalSetStateOptions extends EntitySetStateOptions, EntityInternalOptions {}

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

export interface PaginatedResponse<T> extends Pagination {
    response: T[];
}

export type Response$Factory<T> = (pagination: Pagination) => Observable<T>;

export interface Page {
    ids: Id[] | undefined;
    order?: number;
    hasMore?: boolean;
    loadingState?: LoadingState;
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
    SET_STATE: LoadingStateActionTypes['SET_STATE'];
    CHANGE: 'CHANGE';
    RESOLVE_CHANGE: 'RESOLVE_CHANGE';
    REMOVE: 'REMOVE';
    RESOLVE_REMOVE: 'RESOLVE_REMOVE';
    RESTORE_REMOVED: 'RESTORE_REMOVED';
    CLEAR: 'CLEAR';
    CLEAR_ALL: 'CLEAR_ALL';
}

export type PublicDispatchEntityMethods<T> = Omit<DispatchEntityMethods<T>, 'changeWithId' | 'resolveChange'>
export type PublicSelectEntityMethods<T> = Omit<SelectEntityMethods<T>, 'get$' | 'getDictionary$' | 'getById$'>

export type Entity<T> = {
    actionCreators: EntityActionCreators;
} & PublicSelectEntityMethods<T> & PublicDispatchEntityMethods<T> & MixedEntityMethods<T>
