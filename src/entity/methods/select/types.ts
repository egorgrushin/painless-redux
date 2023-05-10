import { Observable } from 'rxjs';
import { Dictionary, Id, LoadingState } from '../../../system-types';
import { Page } from '../../types';

export interface SelectEntityMethods<T> {
    get$(config: unknown): Observable<T[] | undefined>;

    getDictionary$(config: unknown): Observable<Dictionary<T>>;

    getById$(id: Id): Observable<T | undefined>;

    getLoadingState$(): Observable<LoadingState | undefined>;

    getLoadingStates$(): Observable<Dictionary<LoadingState>>;

    getLoadingStateById$(
        id: Id,
        isAsap?: boolean,
    ): Observable<LoadingState | undefined>;

    getLoadingStateByIds$(
        ids: Id[],
        isAsap?: boolean,
    ): Observable<LoadingState | undefined>;

    getPage$(
        config: unknown,
        isAsap?: boolean,
    ): Observable<Page | undefined>;

    getPageLoadingState$(
        config: unknown,
        isAsap?: boolean,
    ): Observable<LoadingState | undefined>;

    getAll$(): Observable<T[] | undefined>;

    getPages$(): Observable<Page[]>;
}
