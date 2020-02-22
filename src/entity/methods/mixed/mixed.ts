import {
    EntityAddOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveOptions,
    EntityResponse,
    EntitySchema,
    PaginatedResponse,
    Pagination,
    Response$,
    Response$Factory,
} from '../../types';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { DispatchEntityMethods } from '../dispatch/types';
import { SelectEntityMethods } from '../select/types';
import { typedDefaultsDeep } from '../../../utils';
import { getPaginated$, guardIfLoading } from '../../utils';
import { DeepPartial, Dictionary, Id, LoadingState } from '../../../system-types';
import { createMixedEntityMethodsUtils } from './utils';
import { MixedEntityMethods } from './types';
import { ChangeActionOptions } from '../../../shared/change/types';


export const createMixedEntityMethods = <T>(
    dispatchMethods: DispatchEntityMethods<T>,
    selectMethods: SelectEntityMethods<T>,
    schema: EntitySchema<T>,
): MixedEntityMethods<T> => {

    const {
        getRemotePipe,
        getPaginator,
        tryInvoke,
    } = createMixedEntityMethodsUtils(dispatchMethods, selectMethods);

    const loadList = (
        config: any,
        dataSource: Response$<T[]> | Response$Factory<T[]>,
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<never> => {
        options = typedDefaultsDeep(options, { pageSize: schema.pageSize });
        const store$ = selectMethods.get$(config);
        const sourcePipe = getRemotePipe<Pagination, PaginatedResponse<Partial<T>>, never>({
                config,
                options,
                store$,
                remoteObsOrFactory: (pagination) => getPaginated$(dataSource, pagination),
                success: (result) => {
                    const { index, size, response } = result;
                    const data = response.data || [];
                    const isReplace = index === 0;
                    const hasMore = data.length >= size;
                    dispatchMethods.addList(data, config, isReplace, hasMore, options);
                },
            },
        );
        return getPaginator(config, paginatorSubj, options).pipe(sourcePipe);
    };

    const loadById = (
        id: Id | Id[],
        dataSource$: Response$<Partial<T>>,
        options?: EntityLoadOptions,
    ): Observable<never> => {
        const store$ = selectMethods.getById$(id);
        const sourcePipe = getRemotePipe<LoadingState | undefined, EntityResponse<Partial<T>>, never>({
            id,
            options,
            store$,
            remoteObsOrFactory: dataSource$,
            success: (response) => dispatchMethods.add({
                ...response.data,
                id,
            }, null, options),
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
        id: Id | Id[],
        dataSource?: Response$<Partial<T>>,
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
        dataSource$: Response$<Partial<T>>,
        options?: EntityAddOptions,
    ): Response$<Partial<T>> => {
        const sourcePipe = getRemotePipe<null, EntityResponse<Partial<T>>>({
            config,
            options,
            remoteObsOrFactory: dataSource$,
            success: (result) => {
                dispatchMethods.create(result.data, config, options);
            },
            emitOnSuccess: true,
        });
        return of(null).pipe(sourcePipe);
    };


    const changeRemote = (
        patch: DeepPartial<T>,
        id: Id | Id[],
        dataSource$: Observable<any>,
        options?: ChangeActionOptions,
    ): Response$<Partial<T>> => {
        const sourcePipe = getRemotePipe<LoadingState | undefined, EntityResponse<Partial<T>>>({
            id,
            options,
            remoteObsOrFactory: dataSource$,
            success: () => {
                dispatchMethods.change(id, patch, options);
            },
            emitOnSuccess: true,
        });
        const loadingState$ = selectMethods.getLoadingStateById$(id, true);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const removeRemote = (
        id: Id | Id[],
        observable: Observable<EntityResponse>,
        options?: EntityRemoveOptions,
    ): Observable<EntityResponse> => {
        const sourcePipe = getRemotePipe<LoadingState | undefined, EntityResponse>({
            id,
            options,
            remoteObsOrFactory: observable,
            success: () => {
                dispatchMethods.remove(id, options);
            },
            emitSuccessOutsideAffectState: true,
            emitOnSuccess: true,
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
