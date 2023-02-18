import {
    EntityAddOptions,
    EntityGetListOptions,
    EntityGetOptions,
    EntityLoadListOptions,
    EntityLoadOptions,
    EntityRemoveListOptions,
    EntityRemoveOptions,
    EntitySchema,
    IdPatch,
    IdPatchRequest,
    PaginatedResponse,
    Pagination,
    Response$Factory,
    ResponseArray,
} from '../../types';
import { BehaviorSubject, EMPTY, merge, Observable, of } from 'rxjs';
import { DispatchEntityMethods } from '../dispatch/types';
import { SelectEntityMethods } from '../select/types';
import { getPaginated$ } from '../../utils';
import { DeepPartial, Dictionary, Id, LoadingState } from '../../../system-types';
import { createMixedEntityMethodsUtils } from './utils';
import { MixedEntityMethods } from './types';
import { v4 } from 'uuid';
import { PainlessReduxSchema } from '../../../painless-redux/types';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';
import { getPatchByOptions, getResolvePatchByOptions, normalizePatch } from '../../../shared/change/utils';
import { getRemotePipe, guardIfLoading } from '../../../shared/utils';
import { switchMap } from 'rxjs/operators';
import { typedDefaultsDeep } from '../../../utils';

export const createMixedEntityMethods = <T, TPageMetadata>(
    dispatchMethods: DispatchEntityMethods<T, TPageMetadata>,
    selectMethods: SelectEntityMethods<T, TPageMetadata>,
    schema: EntitySchema<T>,
    prSchema: PainlessReduxSchema,
): MixedEntityMethods<T, TPageMetadata> => {

    const {
        getPaginator,
        tryInvoke,
    } = createMixedEntityMethodsUtils<T, TPageMetadata>(dispatchMethods, selectMethods, schema, prSchema);

    const loadList$ = (
        config: unknown,
        dataSource: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
        options?: EntityLoadListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ): Observable<PaginatedResponse<T, TPageMetadata>> => {
        const store$ = selectMethods.get$(config);
        const sourcePipe = getRemotePipe<Pagination, T[] | undefined, PaginatedResponse<T, TPageMetadata>, PaginatedResponse<T, TPageMetadata>>({
                options,
                store$,
                emitOnSuccess: true,
                remoteObsOrFactory: (pagination: Pagination) => getPaginated$(dataSource, pagination),
                success: (result?: PaginatedResponse<T, TPageMetadata>) => {
                    if (!result) return;
                    const { index, size, response } = result;
                    const data = response.data ?? [];
                    const isReplace = index === 0;
                    const hasMore = response.hasMore ?? data.length >= size;
                    const metadata = response.metadata;
                    return dispatchMethods.addList(data, config, isReplace, hasMore, metadata, options);
                },
                setLoadingState: (state) => dispatchMethods.setLoadingStateBus(state, undefined, config, undefined, options),
            },
        );
        const paginator = getPaginator(config, paginatorSubj, options);
        return paginator.pipe(sourcePipe);
    };

    const loadById$ = (
        id: Id,
        dataSource$: Observable<T>,
        options?: EntityLoadOptions,
    ): Observable<T> => {
        const store$ = selectMethods.getById$(id);
        const sourcePipe = getRemotePipe<LoadingState | undefined, T | undefined, T, T>({
            options,
            store$,
            emitOnSuccess: true,
            remoteObsOrFactory: dataSource$,
            success: (response) => {
                if (!response) return;
                const entity = { ...response, id };
                return dispatchMethods.add(entity, undefined, options);
            },
            setLoadingState: (state) => dispatchMethods.setLoadingStateBus(state, id, undefined, undefined, options),
        });
        const loadingState$ = selectMethods.getLoadingStateById$(id, prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const tryInvokeList$ = <S>(
        store$: Observable<S>,
        config: unknown,
        dataSource?: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
        options?: EntityGetListOptions,
        paginatorSubj?: BehaviorSubject<boolean>,
    ) => {
        const invoker = (ds: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>) => loadList$(
            config,
            ds,
            options,
            paginatorSubj,
        );
        return tryInvoke(store$, invoker, dataSource);
    };

    const get$ = (
        config: unknown,
        dataSource?: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
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
        config: unknown,
        dataSource?: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
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
            const remote$ = loadById$(id, dataSource, options).pipe(switchMap(() => EMPTY));
            return merge(store$, remote$);
        }
        return store$;
    };

    const addRemote$ = (
        entity: T,
        config: unknown,
        dataSource$: Observable<T>,
        options?: EntityAddOptions,
    ): Observable<T> => {
        const tempId = v4();
        options = typedDefaultsDeep(options, { rethrow: true });
        const { addWithId, resolveAdd } = dispatchMethods;
        const sourcePipe = getRemotePipe<null, unknown, T, T>({
            options,
            remoteObsOrFactory: dataSource$,
            success: (result) => {
                const newEntity = options?.optimistic ? entity : result;
                if (!newEntity) return;
                return addWithId(newEntity, tempId, config, options);
            },
            emitOnSuccess: true,
            optimistic: options.optimistic,
            optimisticResolve: (success, result) => resolveAdd(result, success, tempId, config, options),
            setLoadingState: (state) => dispatchMethods.setLoadingStateBus(state, undefined, config, undefined, options),
        });
        return of(null).pipe(sourcePipe);
    };

    const changeRemote$ = (
        id: Id,
        patch: PatchRequest<T>,
        dataSource$: Observable<DeepPartial<T> | undefined>,
        options?: ChangeOptions,
    ): Observable<DeepPartial<T> | undefined> => {
        options = typedDefaultsDeep(options, { rethrow: true });
        const changeId = v4();
        const { changeWithId, resolveChange, setLoadingStateBus } = dispatchMethods;
        const { getLoadingStateById$, getById$ } = selectMethods;

        const normalizedPatch = normalizePatch(patch, getById$(id));

        const sourcePipe = getRemotePipe<LoadingState | undefined, unknown, DeepPartial<T> | undefined, DeepPartial<T> | undefined>({
            options,
            remoteObsOrFactory: dataSource$,
            success: (
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getPatchByOptions(normalizedPatch, response, options) ?? {};
                return changeWithId(id, patchToApply, changeId, options);
            },
            emitOnSuccess: true,
            optimistic: options.optimistic,
            optimisticResolve: (
                success: boolean,
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getResolvePatchByOptions(normalizedPatch, response, options);
                return resolveChange(id, changeId, success, patchToApply, options);
            },
            setLoadingState: (state) => setLoadingStateBus(state, id, undefined, undefined, options),
        });
        const loadingState$ = getLoadingStateById$(id, prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const changeListRemote$ = (
        patches: IdPatchRequest<T>[],
        dataSource$: Observable<IdPatch<T>[] | undefined>,
        options?: ChangeOptions,
    ): Observable<IdPatch<T>[] | undefined> => {
        options = typedDefaultsDeep(options, { rethrow: true });
        const changeId = v4();
        const { changeListWithId, resolveChangeList, setLoadingStateByIds } = dispatchMethods;
        const { getLoadingStateByIds$, getById$ } = selectMethods;
        const normalizedPatches: IdPatch<T>[] = patches.map((patch) => ({
            ...patch,
            patch: normalizePatch(patch.patch, getById$(patch.id)),
        }));
        const ids = normalizedPatches.map((patch) => patch.id);

        const sourcePipe = getRemotePipe<LoadingState | undefined, unknown, IdPatch<T>[] | undefined, IdPatch<T>[]>({
            options,
            remoteObsOrFactory: dataSource$,
            success: (
                response?: IdPatch<T>[] | undefined,
            ) => {
                const patchesToApply = normalizedPatches.map((idPatch) => {
                    const responsePatch = response?.find((r) => r.id === idPatch.id);
                    const patch = getPatchByOptions(idPatch.patch, responsePatch?.patch, options) ?? {};
                    return { ...idPatch, patch };
                });
                return changeListWithId(patchesToApply, changeId, options);
            },
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (
                success: boolean,
                response?: IdPatch<T>[] | undefined,
            ) => {
                const patchesToApply = normalizedPatches.map((idPatch) => {
                    const responsePatch = response?.find((r) => r.id === idPatch.id);
                    const patch = getResolvePatchByOptions(idPatch.patch, responsePatch?.patch, options) ?? {};
                    return { ...idPatch, patch };
                });
                return resolveChangeList(patchesToApply, changeId, success, options);
            },
            setLoadingState: (state) => setLoadingStateByIds(ids, state, options),
        });

        const loadingState$ = getLoadingStateByIds$(ids, prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const removeRemote$ = <R>(
        id: Id,
        observable: Observable<R>,
        options?: EntityRemoveOptions,
    ): Observable<R> => {
        options = typedDefaultsDeep(options, { rethrow: true });
        const { remove, resolveRemove } = dispatchMethods;
        const sourcePipe = getRemotePipe<LoadingState | undefined, unknown, R, R>({
            options,
            remoteObsOrFactory: observable,
            success: () => remove(id, options),
            emitSuccessOutsideAffectState: true,
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (success: boolean) => resolveRemove(id, success, options),
            setLoadingState: (state) => dispatchMethods.setLoadingStateBus(state, id, undefined, undefined, options),
        });
        const loadingState$ = selectMethods.getLoadingStateById$(id, prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    const removeListRemote$ = <R>(
        ids: Id[],
        observable: Observable<R>,
        options?: EntityRemoveListOptions,
    ): Observable<R> => {
        options = typedDefaultsDeep(options, { rethrow: true });
        const { removeList, setLoadingStateByIds, resolveRemoveList } = dispatchMethods;
        const sourcePipe = getRemotePipe<LoadingState | undefined, unknown, R, R>({
            options,
            remoteObsOrFactory: observable,
            success: () => removeList(ids, options),
            emitSuccessOutsideAffectState: true,
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (success: boolean) => resolveRemoveList(ids, success, options),
            setLoadingState: (state) => setLoadingStateByIds(ids, state, options),
        });
        const loadingState$ = selectMethods.getLoadingStateByIds$(ids, prSchema.useAsapSchedulerInLoadingGuards);
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
        removeListRemote$,
        changeListRemote$,
    };
};
