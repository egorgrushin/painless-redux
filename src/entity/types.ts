import { Observable } from 'rxjs';
import { Selector } from 'reselect';
import { Dictionary, HashFn, Id, LoadingState } from '../system-types';
import { ChangeActionTypes } from '../shared/change/types';
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

export interface EntityResponse<T = any, M = any, E = any> {
    data: T;
    metadata?: M;
    error?: E;
}

export interface EntitySchema<T> {
    name: string;
    hashFn: HashFn;
    pageSize: number;

    id?(data: Partial<T>): Id;
}

export interface EntityGetOptions {

}

export interface EntityGetListOptions {
    pageSize?: number;
}

export interface EntityLoadListOptions extends EntityGetListOptions, EntityAddListOptions {

}

export interface EntityLoadOptions extends EntityGetOptions, EntityAddOptions {

}

export interface EntityAddOptions extends EntityInsertOptions {

}

export interface EntityRemoveOptions {

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
    response: EntityResponse<T[]>;
}


export type Response$<T> = Observable<EntityResponse<T>>;
export type Response$Factory<T> = (pagination: Pagination) => Response$<T>;
export type ObservableOrFactory<S, R> = (Observable<R>) | ((value: S) => Observable<R>);

export interface RemotePipeConfig<S, R> {
    config?: any;
    id?: Id | Id[];
    store$?: Observable<any>;
    remoteObsOrFactory: ObservableOrFactory<S, R>;
    options?: EntityInsertOptions;
    success: (result: R) => void;
    emitSuccessOutsideAffectState?: boolean;
    emitOnSuccess?: boolean;
}


export interface Page {
    ids?: Id[];
    hasMore?: boolean;
    loadingState?: LoadingState;
}

export interface EntityState<T> extends LoadingStateState {
    ids: Id[];
    dictionary: Dictionary<T>;
    pages: Dictionary<Page>;
    loadingStates: Dictionary<LoadingState>;
}

export type IdsSelector<T> = Selector<EntityState<T>, Id[] | undefined>;
export type DictionarySelector<T> = Selector<EntityState<T>, Dictionary<T>>;
export type PagesSelector<T> = Selector<EntityState<T>, Dictionary<Page>>;
export type PageSelector<T> = Selector<EntityState<T>, Page | undefined>;
export type LoadingStatesSelector<T> = Selector<EntityState<T>, Dictionary<LoadingState>>;
export type InstanceSelector<T> = Selector<EntityState<T>, T>;
export type ListSelector<T> = Selector<EntityState<T>, T[] | undefined>;

export interface BaseEntitySelectors<T> extends LoadingStateSelectors<EntityState<T>> {
    ids: IdsSelector<T>;
    dictionary: DictionarySelector<T>;
    pages: PagesSelector<T>;
    loadingStates: LoadingStatesSelector<T>;
    createLoadingStateById: (id: string) => LoadingStateSelector<EntityState<T>>;
}

export interface EntitySelectors<T> extends BaseEntitySelectors<T> {
    createInstance: (id: string) => InstanceSelector<T>;
    createPage: (config: any) => PageSelector<T>;
    createPageIds: (hash: string) => IdsSelector<T>;
    createPageLoadingState: (config: any) => LoadingStateSelector<EntityState<T>>;
    createPageIdsByConfig: (config: any) => IdsSelector<T>;
    all: ListSelector<T>;
    createSelectorIdsList: (idsSelector: IdsSelector<T>) => ListSelector<T>;
    createPageListByConfig: (config: any) => ListSelector<T>;
}


export interface EntityActionTypes extends ChangeActionTypes {
    REMOVE: 'REMOVE';
    ADD: 'ADD';
    CREATE: 'CREATE';
    ADD_LIST: 'ADD_LIST';
    SET_STATE: LoadingStateActionTypes['SET_STATE'];
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
