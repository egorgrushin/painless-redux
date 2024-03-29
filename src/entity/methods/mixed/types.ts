import {
    EntityAddOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveListOptions,
    EntityRemoveOptions,
    IdPatch,
    IdPatchRequest,
    PaginatedResponse,
    Response$Factory,
    ResponseArray,
} from '../../types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeepPartial, Dictionary, Id } from '../../../system-types';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';

export interface MixedEntityMethods<T, TPageMetadata> {
    loadList$(
        config: unknown,
        dataSource: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<PaginatedResponse<T, TPageMetadata>>;

    loadById$(
        id: Id,
        dataSource$: Observable<T>,
        options?: EntityLoadOptions,
    ): Observable<T>;

    get$(
        config: unknown,
        dataSource?: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<T[] | undefined>;

    getDictionary$(
        config: unknown,
        dataSource?: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
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

    removeListRemote$<R>(
        ids: Id[],
        observable: Observable<R>,
        options?: EntityRemoveListOptions,
    ): Observable<R>;
}
