import { Observable } from 'rxjs';
import { Dictionary, Id, LoadingState } from '../../../system-types';
import { Page } from '../../types';

export interface SelectEntityMethods<T> {
    get$: (config: any) => Observable<T[] | undefined>;
    getDictionary$: (config: any) => Observable<Dictionary<T>>;
    getById$: (id: Id | Id[]) => Observable<T | undefined>;
    getLoadingState$: () => Observable<LoadingState | undefined>;
    getLoadingStates$: () => Observable<Dictionary<LoadingState>>;
    getLoadingStateById$: (id: Id | Id[], isAsap?: boolean) => Observable<LoadingState | undefined>;
    getPage$: (
        config: any,
        isAsap?: boolean,
    ) => Observable<Page | undefined>;
    getPageLoadingState$: (
        config: any,
        isAsap?: boolean,
    ) => Observable<LoadingState | undefined>;
    getAll$: () => Observable<T[] | undefined>;
}
