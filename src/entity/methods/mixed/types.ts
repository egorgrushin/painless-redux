import {
    EntityAddOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveOptions,
    EntityResponse,
    Response$,
    Response$Factory,
} from '../../types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeepPartial, Dictionary, Id } from '../../../system-types';
import { ChangeActionOptions } from '../../../shared/change/types';

export interface MixedEntityMethods<T> {
    loadList: (
        config: any,
        dataSource: (Response$<T[]> | Response$Factory<T[]>),
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ) => Observable<never>;
    loadById: (
        id: Id | Id[],
        dataSource$: Response$<Partial<T>>,
        options?: EntityLoadOptions,
    ) => Observable<never>;
    get$: (
        config: any,
        dataSource?: (Response$<T[]> | Response$Factory<T[]>),
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ) => Observable<T[] | undefined>;
    getDictionary$: (
        config: any,
        dataSource?: (Response$<T[]> | Response$Factory<T[]>),
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ) => Observable<Dictionary<T>>;
    getById$: (
        id: Id | Id[],
        dataSource?: Response$<Partial<T>>,
        options?: EntityGetOptions,
    ) => Observable<T | undefined>;
    createRemote: (
        config: any,
        dataSource$: Response$<Partial<T>>,
        options?: EntityAddOptions,
    ) => Response$<Partial<T>>;
    changeRemote: (
        patch: DeepPartial<T>,
        id: Id | Id[],
        dataSource$: Observable<any>,
        options?: ChangeActionOptions,
    ) => Response$<Partial<T>>;
    removeRemote: (
        id: Id | Id[],
        observable: Observable<EntityResponse>,
        options?: EntityRemoveOptions,
    ) => Observable<EntityResponse>;
}
