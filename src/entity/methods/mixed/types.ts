import {
    EntityAddOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveOptions, IdPatch, IdPatchRequest, PaginatedResponse,
    Response$Factory,
} from '../../types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeepPartial, Dictionary, Id } from '../../../system-types';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';

export interface MixedEntityMethods<T> {
    loadList$(
        config: unknown,
        dataSource: (Observable<T[]> | Response$Factory<T[]>),
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<PaginatedResponse<T>>;

    loadById$(
        id: Id,
        dataSource$: Observable<T>,
        options?: EntityLoadOptions,
    ): Observable<T>;

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
        patch: PatchRequest<T>,
        dataSource$: Observable<DeepPartial<T> | undefined>,
        options?: ChangeOptions,
    ): Observable<DeepPartial<T> | undefined>;

    changeListRemote$(
        patches: IdPatchRequest<T>[],
        dataSource$: Observable<IdPatch<T>[] | undefined>,
        options?: ChangeOptions,
    ): Observable<IdPatch<T>[] | undefined>;

    removeRemote$<R>(
        id: Id,
        observable: Observable<R>,
        options?: EntityRemoveOptions,
    ): Observable<R>;
}
