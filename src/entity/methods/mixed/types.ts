import {
    EntityAddOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveOptions,
    Response$Factory,
} from '../../types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeepPartial, Dictionary, Id } from '../../../system-types';
import { ChangeOptions } from '../../../shared/change/types';

export interface MixedEntityMethods<T> {
    loadList$(
        config: unknown,
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
        config: unknown,
        dataSource?: (Observable<T[]> | Response$Factory<T[]>),
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<T[] | undefined>;

    getDictionary$(
        config: unknown,
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
        config: unknown,
        dataSource$: Observable<T>,
        options?: EntityAddOptions,
    ): Observable<T>;

    changeRemote$(
        id: Id,
        patch: DeepPartial<T>,
        dataSource$: Observable<DeepPartial<T> | undefined>,
        options?: ChangeOptions,
    ): Observable<DeepPartial<T>>;

    removeRemote$(
        id: Id,
        observable: Observable<T>,
        options?: EntityRemoveOptions,
    ): Observable<T>;
}
