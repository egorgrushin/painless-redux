import { Observable } from 'rxjs';
import { Selector } from 'reselect';
import { AnyAction, DeepPartial, Dictionary, HashFn, Id, LoadingState } from '../system-types';
import { ChangeOptions } from '../shared/change/types';
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

export type EntityType<T> = T & { id: Id };

export interface EntitySchema<T> {
    name: string;
    hashFn: HashFn;
    pageSize: number;

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

export interface EntityAddOptions extends EntityInsertOptions {

}

export interface EntityOptimisticOptions {
    optimistic?: boolean;
}

export interface EntityRemoteOptions extends EntityOptimisticOptions {
    single?: boolean;
}

export interface EntityRemoveOptions extends EntityOptimisticOptions {
    safe?: boolean;
}

export interface EntityChangeOptions extends EntityOptimisticOptions, ChangeOptions {
    useResponsePatch?: boolean;
}

export interface EntitySetStateOptions extends LoadingStateSetOptions {

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

export interface PaginatedResponse<T> extends Pagination {
    response: T[];
}

export type Response$Factory<T> = (pagination: Pagination) => Observable<T>;
export type ObservableOrFactory<S, R> = (Observable<R>) | ((value: S) => Observable<R>);

export interface RemotePipeConfig<S, R> {
    config?: any;
    id?: Id;
    store$?: Observable<any>;
    remoteObsOrFactory: ObservableOrFactory<S, R>;
    options?: EntityRemoteOptions;
    success: (result?: R) => AnyAction | undefined;
    emitSuccessOutsideAffectState?: boolean;
    emitOnSuccess?: boolean;
    optimistic?: boolean;
    optimisticResolve?: (
        success: boolean,
        result?: R,
    ) => AnyAction | undefined;
}

export interface Page {
    ids?: Id[];
    hasMore?: boolean;
    loadingState?: LoadingState;
}

export interface EntityChange<T> {
    stable: boolean;
    patch: DeepPartial<T>;
    merge: boolean;
    id?: string;
}

export interface EntityInstanceState<T> {
    actual: EntityType<T>;
    changes?: EntityChange<T>[];
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
    createPage: (config: any) => PageSelector<T>;
    createPageIds: (hash: string) => IdsSelector<T>;
    createPageLoadingState: (config: any) => LoadingStateSelector<EntityState<T>>;
    createPageIdsByConfig: (config: any) => IdsSelector<T>;
    all: ListSelector<T>;
    createListSelectorByIds: (idsSelector: IdsSelector<T>) => ListSelector<T>;
    createPageListByConfig: (config: any) => ListSelector<T>;
}

export interface EntityActionTypes {
    REMOVE: 'REMOVE';
    ADD: 'ADD';
    CREATE: 'CREATE';
    ADD_LIST: 'ADD_LIST';
    SET_STATE: LoadingStateActionTypes['SET_STATE'];
    CHANGE: 'CHANGE';
    RESOLVE_CHANGE: 'RESOLVE_CHANGE';
    RESOLVE_REMOVE: 'RESOLVE_REMOVE';
    RESTORE_REMOVED: 'RESTORE_REMOVED';
}

export type Entity<T> = {
    getPage$: SelectEntityMethods<T>['getPage$'];
    getPageLoadingState$: SelectEntityMethods<T>['getPageLoadingState$'];
    getLoadingStateById$: SelectEntityMethods<T>['getLoadingStateById$'];
    getAll$: SelectEntityMethods<T>['getAll$'];
    getLoadingState$: SelectEntityMethods<T>['getLoadingState$'];
    getLoadingStates$: SelectEntityMethods<T>['getLoadingStates$'];
    actionCreators: EntityActionCreators;
} & DispatchEntityMethods<T> & MixedEntityMethods<T>
