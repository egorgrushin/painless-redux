import { AnyAction, LoadingState } from '../system-types';
import { Observable } from 'rxjs';

export type ObservableOrFactory<S, R> = (Observable<R>) | ((value: S) => Observable<R>);

export interface RemotePipeConfig<TSource, TStore, TResponse> {
    store$?: Observable<TStore>;
    remoteObsOrFactory: ObservableOrFactory<TSource, TResponse>;
    options?: RemoteOptions;
    success: (result?: TResponse) => AnyAction | undefined;
    emitSuccessOutsideAffectState?: boolean;
    emitOnSuccess?: boolean;
    optimistic?: boolean;
    optimisticResolve?: (
        success: boolean,
        result?: TResponse,
    ) => AnyAction | undefined;
    setLoadingState?: (loadingState: LoadingState) => void;
}

export interface OptimisticOptions {
    optimistic?: boolean;
}

export interface RequestOptions {
    rethrow?: boolean;
    globalLoadingState?: boolean;
}

export interface RemoteOptions extends OptimisticOptions, RequestOptions {
    single?: boolean;
}
