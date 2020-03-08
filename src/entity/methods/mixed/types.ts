import {
    EntityAddOptions,
    EntityChangeOptions,
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

export interface MixedEntityMethods<T> {
    loadList(
        config: any,
        dataSource: (Response$<T[]> | Response$Factory<T[]>),
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<never>;

    loadById(
        id: Id,
        dataSource$: Response$<T>,
        options?: EntityLoadOptions,
    ): Observable<never>;

    get$(
        config: any,
        dataSource?: (Response$<T[]> | Response$Factory<T[]>),
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<T[] | undefined>;

    getDictionary$(
        config: any,
        dataSource?: (Response$<T[]> | Response$Factory<T[]>),
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<Dictionary<T>>;

    getById$(
        id: Id,
        dataSource?: Response$<T>,
        options?: EntityGetOptions,
    ): Observable<T | undefined>;

    createRemote(
        config: any,
        dataSource$: Response$<T>,
        options?: EntityAddOptions,
    ): Response$<T>;

    changeRemote(
        id: Id,
        patch: DeepPartial<T>,
        dataSource$: Observable<any>,
        options?: EntityChangeOptions,
    ): Response$<DeepPartial<T>>;

    removeRemote(
        id: Id,
        observable: Observable<EntityResponse>,
        options?: EntityRemoveOptions,
    ): Observable<EntityResponse>;
}
