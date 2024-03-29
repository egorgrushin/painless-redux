import { BehaviorSubject, EMPTY, merge, Observable, of } from 'rxjs';
import { EntityGetListOptions, EntitySchema, Page, Pagination } from '../../types';
import { map, scan, switchMap, take } from 'rxjs/operators';
import { DispatchEntityMethods } from '../dispatch/types';
import { SelectEntityMethods } from '../select/types';
import { PainlessReduxSchema } from '../../../painless-redux/types';
import { ObservableOrFactory } from '../../../shared/types';
import { guardIfLoading } from '../../../shared/utils';

export const createMixedEntityMethodsUtils = <T, TPageMetadata>(
    dispatchMethods: DispatchEntityMethods<T, TPageMetadata>,
    selectMethods: SelectEntityMethods<T, TPageMetadata>,
    schema: EntitySchema<T>,
    prSchema: PainlessReduxSchema,
) => {
    const { getPage$, getPageLoadingState$ } = selectMethods;

    const getPaginator = (
        config: unknown,
        paginatorSubj?: BehaviorSubject<boolean>,
        options?: EntityGetListOptions,
    ): Observable<Pagination> => {
        paginatorSubj = paginatorSubj ?? new BehaviorSubject<boolean>(false);
        const page$ = getPage$(config);
        const loadingState$ = getPageLoadingState$(config, prSchema.useAsapSchedulerInLoadingGuards);
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
                map((page: Page<TPageMetadata> | undefined) => !page || page.hasMore !== false),
                switchMap((hasMore: boolean) => paging.index === 0 || hasMore ? of(paging) : EMPTY),
            )),
        );
    };

    const tryInvoke = <T, R, S>(
        store$: Observable<S>,
        invoker: (dataSource: ObservableOrFactory<T, R>) => Observable<unknown>,
        dataSource?: ObservableOrFactory<T, R>,
    ) => {
        if (dataSource) {
            const result$ = invoker(dataSource).pipe(switchMap(() => EMPTY));
            return merge(store$, result$);
        }
        return store$;
    };

    return { getPaginator, tryInvoke };
};
