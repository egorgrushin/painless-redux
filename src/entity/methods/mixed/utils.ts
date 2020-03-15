import { BehaviorSubject, EMPTY, merge, Observable, of, OperatorFunction } from 'rxjs';
import {
    EntityChangeOptions,
    EntityGetListOptions,
    EntitySchema,
    ObservableOrFactory,
    Page,
    Pagination,
    RemotePipeConfig,
} from '../../types';
import { catchError, first, map, scan, switchMap, take, tap } from 'rxjs/operators';
import { getObservable$, guardByOptions, guardIfLoading } from '../../utils';
import { DispatchEntityMethods } from '../dispatch/types';
import { SelectEntityMethods } from '../select/types';
import { DeepPartial } from '../../../system-types';
import { PainlessReduxSchema } from '../../../painless-redux/types';

export const createMixedEntityMethodsUtils = <T>(
    dispatchMethods: DispatchEntityMethods<T>,
    selectMethods: SelectEntityMethods<T>,
    schema: EntitySchema<T>,
    prSchema: PainlessReduxSchema,
) => {
    const getPaginator = (
        config: any,
        paginatorSubj?: BehaviorSubject<boolean>,
        options?: EntityGetListOptions,
    ): Observable<Pagination> => {
        paginatorSubj = paginatorSubj ?? new BehaviorSubject<boolean>(false);
        const page$ = selectMethods.getPage$(config);
        const loadingState$ = selectMethods.getPageLoadingState$(config, prSchema.useAsapSchedulerInLoadingGuards);
        return paginatorSubj.pipe(
            switchMap((isNext) => guardIfLoading(loadingState$).pipe(map(() => isNext))),
            scan((
                prevIndex: number,
                isNext: boolean,
            ) => isNext ? prevIndex + 1 : 0, -1),
            map((index: number) => {
                const size = options?.pageSize ?? schema.pageSize;
                const from = index * size;
                const to = from + size - 1;
                return { index, size, from, to };
            }),
            switchMap((paging: Pagination) => page$.pipe(
                take(1),
                map((page: Page | undefined) => !page || page.hasMore !== false),
                switchMap((hasMore: boolean) => paging.index === 0 || hasMore ? of(paging) : EMPTY),
            )),
        );
    };

    const getRemotePipe = <S, R, F = R>(
        {
            config,
            id,
            store$,
            remoteObsOrFactory,
            options,
            success,
            emitSuccessOutsideAffectState,
            emitOnSuccess,
            optimistic,
            optimisticResolve,
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
                            dispatchMethods.setStateBus({ error, isLoading: false }, id, config);
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

                const affectPipe = dispatchMethods.affectStateByConfigOrId(config, id, undefined, false)(...pipesToAffect);
                resultPipes.unshift(affectPipe);

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

    const tryInvoke = <T, R, S>(
        store$: Observable<S>,
        invoker: (dataSource: ObservableOrFactory<T, R>) => Observable<never>,
        dataSource?: ObservableOrFactory<T, R>,
    ) => {
        if (dataSource) {
            const result$ = invoker(dataSource);
            return merge(store$, result$);
        }
        return store$;
    };

    const getPatchByOptions = (
        patch: DeepPartial<T>,
        response: DeepPartial<T> | undefined,
        options?: EntityChangeOptions,
    ): DeepPartial<T> => {
        if (options?.optimistic) return patch;
        if (options?.useResponsePatch) return response ?? {};
        return patch;
    };

    const getResolvePatchByOptions = (
        patch: DeepPartial<T>,
        response: DeepPartial<T> | undefined,
        options?: EntityChangeOptions,
    ): DeepPartial<T> | undefined => {
        if (options?.useResponsePatch) return response;
    };

    return { getRemotePipe, getPaginator, tryInvoke, getPatchByOptions, getResolvePatchByOptions };
};
