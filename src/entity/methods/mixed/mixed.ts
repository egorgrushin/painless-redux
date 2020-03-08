import {
    EntityAddOptions,
    EntityChangeOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveOptions,
    EntityResponse,
    PaginatedResponse,
    Pagination,
    Response$,
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

export const createMixedEntityMethods = <T>(
    dispatchMethods: DispatchEntityMethods<T>,
    selectMethods: SelectEntityMethods<T>,
): MixedEntityMethods<T> => {

    const {
        getRemotePipe,
        getPaginator,
        tryInvoke,
        getPatchByOptions,
        getResolvePatchByOptions,
    } = createMixedEntityMethodsUtils(dispatchMethods, selectMethods);

    const loadList = (
        config: any,
        dataSource: Response$<T[]> | Response$Factory<T[]>,
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
                    const data = response.data || [];
                    const isReplace = index === 0;
                    const hasMore = data.length >= size;
                    return dispatchMethods.addList(data, config, isReplace, hasMore, options);
                },
            },
        );
        return getPaginator(config, paginatorSubj, options).pipe(sourcePipe);
    };

    const loadById = (
        id: Id,
        dataSource$: Response$<T>,
        options?: EntityLoadOptions,
    ): Observable<never> => {
        const store$ = selectMethods.getById$(id);
        const sourcePipe = getRemotePipe<LoadingState | undefined, EntityResponse<T>, never>({
            id,
            options,
            store$,
            remoteObsOrFactory: dataSource$,
            success: (response) => {
                if (!response) return;
                return dispatchMethods.add({
                    ...response.data,
                    id,
                }, null, options);
            },
        });
        const loadingState$ = selectMethods.getLoadingStateById$(id, true);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const tryInvokeList = (
        store$: Observable<any>,
        config: any,
        dataSource?: Response$<T[]> | Response$Factory<T[]>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ) => {
        const invoker = (ds: Response$<T[]> | Response$Factory<T[]>) => loadList(
            config,
            ds,
            options,
            paginatorSubj,
        );
        return tryInvoke(store$, invoker, dataSource);
    };

    const get$ = (
        config: any,
        dataSource?: Response$<T[]> | Response$Factory<T[]>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<T[] | undefined> => {
        const store$ = selectMethods.get$(config);
        return tryInvokeList(
            store$,
            config,
            dataSource,
            options,
            paginatorSubj,
        );
    };

    const getDictionary$ = (
        config: any,
        dataSource?: Response$<T[]> | Response$Factory<T[]>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<Dictionary<T>> => {
        const store$ = selectMethods.getDictionary$(config);
        return tryInvokeList(
            store$,
            config,
            dataSource,
            options,
            paginatorSubj,
        );
    };

    const getById$ = (
        id: Id,
        dataSource?: Response$<T>,
        options?: EntityGetOptions,
    ): Observable<T | undefined> => {
        const store$ = selectMethods.getById$(id);
        if (dataSource) {
            const remote$ = loadById(id, dataSource, options);
            return merge(store$, remote$);
        }
        return store$;
    };

    const createRemote = (
        config: any,
        dataSource$: Response$<T>,
        options?: EntityAddOptions,
    ): Response$<T> => {
        const sourcePipe = getRemotePipe<null, EntityResponse<T>>({
            config,
            options,
            remoteObsOrFactory: dataSource$,
            success: (result) => {
                if (!result) return;
                return dispatchMethods.create(result.data, config, options);
            },
            emitOnSuccess: true,
        });
        return of(null).pipe(sourcePipe);
    };

    const changeRemote = (
        id: Id,
        patch: DeepPartial<T>,
        dataSource$: Observable<any>,
        options?: EntityChangeOptions,
    ): Response$<DeepPartial<T>> => {
        const changeId = v4();
        const { changeWithId, resolveChange } = dispatchMethods;
        const { getLoadingStateById$ } = selectMethods;

        const sourcePipe = getRemotePipe<LoadingState | undefined, EntityResponse<DeepPartial<T>>>({
            id,
            options,
            remoteObsOrFactory: dataSource$,
            success: (
                response?: EntityResponse<DeepPartial<T>>,
            ) => {
                const patchToApply = getPatchByOptions(patch, response, options) ?? {};
                return changeWithId(id, patchToApply, changeId, options);
            },
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (
                success: boolean,
                response?: EntityResponse<DeepPartial<T>>,
            ) => {
                const patchToApply = getResolvePatchByOptions(patch, response, options);
                return resolveChange(id, changeId, success, patchToApply, options);
            },
        });
        const loadingState$ = getLoadingStateById$(id, true);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const removeRemote = (
        id: Id,
        observable: Observable<EntityResponse>,
        options?: EntityRemoveOptions,
    ): Observable<EntityResponse> => {
        const sourcePipe = getRemotePipe<LoadingState | undefined, EntityResponse>({
            id,
            options,
            remoteObsOrFactory: observable,
            success: () => dispatchMethods.remove(id, options),
            emitSuccessOutsideAffectState: true,
            emitOnSuccess: true,
            optimistic: options?.optimistic,
        });
        const loadingState$ = selectMethods.getLoadingStateById$(id, true);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    return {
        loadList,
        loadById,
        get$,
        getDictionary$,
        getById$,
        createRemote,
        changeRemote,
        removeRemote,
    };
};
