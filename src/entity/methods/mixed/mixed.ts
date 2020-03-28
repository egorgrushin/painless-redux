import {
    EntityAddOptions,
    EntityChangeOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveOptions,
    EntitySchema,
    PaginatedResponse,
    Pagination,
    Response$Factory,
} from '../../types';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { DispatchEntityMethods } from '../dispatch/types';
import { SelectEntityMethods } from '../select/types';
import { getPaginated$, guardIfLoading } from '../../utils';
import { DeepPartial, Dictionary, Id, LoadingState } from '../../../system-types';
import { createMixedEntityMethodsUtils } from './utils';
import { MixedEntityMethods } from './types';
import { v4 } from 'uuid';
import { PainlessReduxSchema } from '../../../painless-redux/types';

export const createMixedEntityMethods = <T>(
    dispatchMethods: DispatchEntityMethods<T>,
    selectMethods: SelectEntityMethods<T>,
    schema: EntitySchema<T>,
    prSchema: PainlessReduxSchema,
): MixedEntityMethods<T> => {

    const {
        getRemotePipe,
        getPaginator,
        tryInvoke,
        getPatchByOptions,
        getResolvePatchByOptions,
    } = createMixedEntityMethodsUtils(dispatchMethods, selectMethods, schema, prSchema);

    const loadList$ = (
        config: any,
        dataSource: Observable<T[]> | Response$Factory<T[]>,
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<never> => {
        const store$ = selectMethods.get$(config);
        const sourcePipe = getRemotePipe<Pagination, PaginatedResponse<T>, never>({
                config,
                options,
                store$,
                remoteObsOrFactory: (pagination) => getPaginated$(dataSource, pagination),
                success: (result) => {
                    if (!result) return;
                    const { index, size, response } = result;
                    const data = response || [];
                    const isReplace = index === 0;
                    const hasMore = data.length >= size;
                    return dispatchMethods.addList(data, config, isReplace, hasMore, options);
                },
            },
        );
        return getPaginator(config, paginatorSubj, options).pipe(sourcePipe);
    };

    const loadById$ = (
        id: Id,
        dataSource$: Observable<T>,
        options?: EntityLoadOptions,
    ): Observable<never> => {
        const store$ = selectMethods.getById$(id);
        const sourcePipe = getRemotePipe<LoadingState | undefined, T, never>({
            id,
            options,
            store$,
            remoteObsOrFactory: dataSource$,
            success: (response) => {
                if (!response) return;
                const entity = { ...response, id };
                return dispatchMethods.add(entity, undefined, options);
            },
        });
        const loadingState$ = selectMethods.getLoadingStateById$(id, prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const tryInvokeList$ = (
        store$: Observable<any>,
        config: any,
        dataSource?: Observable<T[]> | Response$Factory<T[]>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ) => {
        const invoker = (ds: Observable<T[]> | Response$Factory<T[]>) => loadList$(
            config,
            ds,
            options,
            paginatorSubj,
        );
        return tryInvoke(store$, invoker, dataSource);
    };

    const get$ = (
        config: any,
        dataSource?: Observable<T[]> | Response$Factory<T[]>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<T[] | undefined> => {
        const store$ = selectMethods.get$(config);
        return tryInvokeList$(
            store$,
            config,
            dataSource,
            options,
            paginatorSubj,
        );
    };

    const getDictionary$ = (
        config: any,
        dataSource?: Observable<T[]> | Response$Factory<T[]>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<Dictionary<T>> => {
        const store$ = selectMethods.getDictionary$(config);
        return tryInvokeList$(
            store$,
            config,
            dataSource,
            options,
            paginatorSubj,
        );
    };

    const getById$ = (
        id: Id,
        dataSource?: Observable<T>,
        options?: EntityGetOptions,
    ): Observable<T | undefined> => {
        const store$ = selectMethods.getById$(id);
        if (dataSource) {
            const remote$ = loadById$(id, dataSource, options);
            return merge(store$, remote$);
        }
        return store$;
    };

    const addRemote$ = (
        entity: T,
        config: any,
        dataSource$: Observable<T>,
        options?: EntityAddOptions,
    ): Observable<T> => {
        const tempId = v4();
        const { addWithId, resolveAdd } = dispatchMethods;
        const sourcePipe = getRemotePipe<null, T>({
            config,
            options,
            remoteObsOrFactory: dataSource$,
            success: (result) => {
                const newEntity = options?.optimistic ? entity : result;
                if (!newEntity) return;
                return addWithId(newEntity, tempId, config, options);
            },
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (success, result) => resolveAdd(result, success, tempId, config, options),
        });
        return of(null).pipe(sourcePipe);
    };

    const changeRemote$ = (
        id: Id,
        patch: DeepPartial<T>,
        dataSource$: Observable<any>,
        options?: EntityChangeOptions,
    ): Observable<DeepPartial<T>> => {
        const changeId = v4();
        const { changeWithId, resolveChange } = dispatchMethods;
        const { getLoadingStateById$ } = selectMethods;

        const sourcePipe = getRemotePipe<LoadingState | undefined, DeepPartial<T>>({
            id,
            options,
            remoteObsOrFactory: dataSource$,
            success: (
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getPatchByOptions(patch, response, options) ?? {};
                return changeWithId(id, patchToApply, changeId, options);
            },
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (
                success: boolean,
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getResolvePatchByOptions(patch, response, options);
                return resolveChange(id, changeId, success, patchToApply, options);
            },
        });
        const loadingState$ = getLoadingStateById$(id, prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const removeRemote$ = (
        id: Id,
        observable: Observable<T>,
        options?: EntityRemoveOptions,
    ): Observable<T> => {
        const { remove, resolveRemove } = dispatchMethods;
        const sourcePipe = getRemotePipe<LoadingState | undefined, T>({
            id,
            options,
            remoteObsOrFactory: observable,
            success: () => remove(id, options),
            emitSuccessOutsideAffectState: true,
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (success: boolean) => resolveRemove(id, success, options),
        });
        const loadingState$ = selectMethods.getLoadingStateById$(id, prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    return {
        loadList$,
        loadById$,
        get$,
        getDictionary$,
        getById$,
        addRemote$,
        changeRemote$,
        removeRemote$,
    };
};
