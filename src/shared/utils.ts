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

export const getRemotePipe = <T, S, R, F = R>(
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
    }: RemotePipeConfig<S, R>,
): OperatorFunction<S, F> => {
    const trailPipe: OperatorFunction<R, F> = emitOnSuccess
        ? map((result: R) => result as unknown as F)
        : switchMap(() => EMPTY);

    return (source: Observable<S>): Observable<F> => source.pipe(
        switchMap((value: S) => {
            const remote$ = getObservable$<S, R>(remoteObsOrFactory, value);
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
            const successPipe = tap((result: R) => success(result));
            const pipesToAffect: any = [
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

            if (!store$) return (of(value) as any).pipe(...resultPipes) as Observable<R>;
            return (store$ as any).pipe(
                first(),
                guardByOptions<T>(options),
                ...resultPipes,
            ) as Observable<R>;
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

