import { AnyAction, LoadingState } from '../system-types';
import { Observable } from 'rxjs';

export type ObservableOrFactory<S, R> = (Observable<R>) | ((value: S) => Observable<R>);

export interface RemotePipeConfig<S, R> {
    store$?: Observable<any>;
    remoteObsOrFactory: ObservableOrFactory<S, R>;
    options?: RemoteOptions;
    success: (result?: R) => AnyAction | undefined;
    emitSuccessOutsideAffectState?: boolean;
    emitOnSuccess?: boolean;
    optimistic?: boolean;
    optimisticResolve?: (
        success: boolean,
        result?: R,
    ) => AnyAction | undefined;
    setState?: (loadingState: LoadingState) => void;
}

export interface OptimisticOptions {
    optimistic?: boolean;
}

export interface RemoteOptions extends OptimisticOptions {
    single?: boolean;
}
