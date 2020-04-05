import { EMPTY, MonoTypeOperatorFunction, Observable, of, OperatorFunction } from 'rxjs';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { ObservableOrFactory, RemoteOptions, RemotePipeConfig } from './types';
import { isNil } from 'lodash';
import { LoadingState } from '../system-types';
import { affectStateFactory } from '../affect-state/affect-state';

export const getObservable$ = <S, R>(
    observableOrFactory: ObservableOrFactory<S, R>,
    value: S,
): Observable<R> => observableOrFactory instanceof Observable
    ? observableOrFactory
    : observableOrFactory(value);

export const guardByOptions = <T>(
    options?: RemoteOptions,
): MonoTypeOperatorFunction<T | T[]> => (
    source: Observable<T | T[]>,
): Observable<T | T[]> => source.pipe(
    filter((storeValue) => !options?.single || isNil(storeValue)),
);

export const getRemotePipe = <TSource, TStore, TResponse, TOutput>(
    {
        store$,
        remoteObsOrFactory,
        options,
        success,
        emitSuccessOutsideAffectState,
        emitOnSuccess,
        optimistic,
        optimisticResolve,
        setState,
    }: RemotePipeConfig<TSource, TStore, TResponse>,
): OperatorFunction<TSource, TOutput> => {
    const trailPipe: OperatorFunction<TResponse, TOutput> = emitOnSuccess
        ? map((result: TResponse) => result as unknown as TOutput)
        : switchMap(() => EMPTY);

    return (source: Observable<TSource>): Observable<TOutput> => source.pipe(
        switchMap((value: TSource) => {
            const remote$ = getObservable$(remoteObsOrFactory, value);
            if (optimistic) {
                success();
                return remote$.pipe(
                    tap((response) => optimisticResolve?.(true, response)),
                    catchError((error: any) => {
                        optimisticResolve?.(false);
                        setState?.({ error, isLoading: false });
                        return EMPTY;
                    }),
                );
            }
            const successPipe = tap((result: TResponse) => success(result));
            const pipesToAffect: OperatorFunction<any, any>[] = [
                switchMap(() => remote$),
            ];
            const resultPipes: OperatorFunction<any, any>[] = [];

            if (emitSuccessOutsideAffectState) {
                resultPipes.push(successPipe);
            } else {
                pipesToAffect.push(successPipe);
            }

            if (setState) {
                const affectStateObsFactory = affectStateFactory(setState, false);
                const affectPipe = affectStateObsFactory(...pipesToAffect);
                resultPipes.unshift(affectPipe);
            } else {
                resultPipes.unshift(...pipesToAffect);
            }
            if (store$) {
                return (store$ as any).pipe(
                    first(),
                    guardByOptions<TSource>(options),
                    ...resultPipes,
                ) as Observable<TResponse>;
            }
            return (of(value) as any).pipe(...resultPipes) as Observable<TResponse>;

        }),
        trailPipe,
    );
};

export const guardIfLoading = (
    loadingStateObs: Observable<LoadingState | undefined>,
): Observable<LoadingState | undefined> => loadingStateObs.pipe(
    first(),
    filter((loadingState: LoadingState | undefined) => !loadingState?.isLoading),
);

