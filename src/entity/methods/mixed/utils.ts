import { BehaviorSubject, EMPTY, merge, Observable, of, OperatorFunction } from 'rxjs';
import { EntityGetListOptions, ObservableOrFactory, Page, Pagination, RemotePipeConfig } from '../../types';
import { first, map, scan, switchMap, tap } from 'rxjs/operators';
import { getObservable$, guardByOptions, guardIfLoading } from '../../utils';
import { DEFAULT_PAGE_SIZE } from '../../constants';
import { DispatchEntityMethods } from '../dispatch/types';
import { SelectEntityMethods } from '../select/types';

export const createMixedEntityMethodsUtils = <T>(
    dispatchMethods: DispatchEntityMethods<T>,
    selectMethods: SelectEntityMethods<T>,
) => {
    const getPaginator = (
        config: any,
        paginatorSubj?: BehaviorSubject<boolean>,
        options?: EntityGetListOptions,
    ): Observable<Pagination> => {
        paginatorSubj = paginatorSubj ?? new BehaviorSubject<boolean>(false);
        const page$ = selectMethods.getPage$(config);
        const loadingState$ = selectMethods.getPageLoadingState$(config, true);
        return paginatorSubj.pipe(
            switchMap((isNext) => guardIfLoading(loadingState$).pipe(map(() => isNext))),
            scan((
                prevIndex: number,
                isNext: boolean,
            ) => isNext ? prevIndex + 1 : 0, -1),
            map((index: number) => {
                const size = options?.pageSize ?? DEFAULT_PAGE_SIZE;
                const from = index * size;
                const to = from + size - 1;
                return { index, size, from, to };
            }),
            switchMap((paging: Pagination) => page$.pipe(
                first(),
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
        }: RemotePipeConfig<S, R>,
    ): OperatorFunction<S, F> => {
        let trailPipe: OperatorFunction<R, F> = map((result: R) => result as unknown as F);
        if (!emitOnSuccess) {
            trailPipe = switchMap(() => EMPTY);
        }
        return (source: Observable<S>): Observable<F> => source.pipe(
            switchMap((value: S) => {
                const remote$ = getObservable$<S, R>(remoteObsOrFactory, value);
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

    return { getRemotePipe, getPaginator, tryInvoke };
};