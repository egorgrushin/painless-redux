import {
    EntityAddOptions,
    EntityChangeOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveOptions,
    Response$Factory,
} from '../../types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeepPartial, Dictionary, Id } from '../../../system-types';

export interface MixedEntityMethods<T> {
    loadList$(
        config: any,
        dataSource: (Observable<T[]> | Response$Factory<T[]>),
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<never>;

    loadById$(
        id: Id,
        dataSource$: Observable<T>,
        options?: EntityLoadOptions,
    ): Observable<never>;

    get$(
        config: any,
        dataSource?: (Observable<T[]> | Response$Factory<T[]>),
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<T[] | undefined>;

    getDictionary$(
        config: any,
        dataSource?: (Observable<T[]> | Response$Factory<T[]>),
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<Dictionary<T>>;

    getById$(
        id: Id,
        dataSource?: Observable<T>,
        options?: EntityGetOptions,
    ): Observable<T | undefined>;

    addRemote$(
        entity: T,
        config: any,
        dataSource$: Observable<T>,
        options?: EntityAddOptions,
    ): Observable<T>;

    changeRemote$(
        id: Id,
        patch: DeepPartial<T>,
        dataSource$: Observable<any>,
        options?: EntityChangeOptions,
    ): Observable<DeepPartial<T>>;

    removeRemote$(
        id: Id,
        observable: Observable<T>,
        options?: EntityRemoveOptions,
    ): Observable<T>;
}
