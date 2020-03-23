import { createActionTypes, hashIt, merge as mergeFn, typedDefaultsDeep } from '../utils';
import {
    EntityActionTypes,
    EntityChange,
    EntityInstanceState,
    EntityRemoteOptions,
    EntitySchema,
    EntityType,
    ObservableOrFactory,
    PaginatedResponse,
    Pagination,
    Response$Factory,
} from './types';
import { isNil } from 'lodash';
import { DEFAULT_PAGE_SIZE, ENTITY_TYPE_NAMES } from './constants';
import { v4 } from 'uuid';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { DeepPartial, LoadingState } from '../system-types';
import { filter, first, map } from 'rxjs/operators';

export const getHash = (config: any): string => hashIt(config);

export const getFullEntitySchema = <T>(
    schema?: Partial<EntitySchema<T>>,
): EntitySchema<T> => typedDefaultsDeep(schema, {
    name: '',
    hashFn: getHash,
    pageSize: DEFAULT_PAGE_SIZE,
}) as EntitySchema<T>;

export const createIdResolver = <T>(
    schema: EntitySchema<T>,
) => (data: T): EntityType<T> => {
    if ('id' in data) return data as EntityType<T>;
    const id = schema.id?.(data) ?? v4();
    return { ...data, id };
};

export const createEntityActionTypes = (
    entityName: string,
): EntityActionTypes => createActionTypes(ENTITY_TYPE_NAMES, entityName);

export const getObservable$ = <S, R>(
    observableOrFactory: ObservableOrFactory<S, R>,
    value: S,
): Observable<R> => observableOrFactory instanceof Observable
    ? observableOrFactory
    : observableOrFactory(value);

export const guardIfLoading = (
    loadingStateObs: Observable<LoadingState | undefined>,
): Observable<LoadingState | undefined> => loadingStateObs.pipe(
    first(),
    filter((loadingState: LoadingState | undefined) => !loadingState?.isLoading),
);

export const guardByOptions = <T>(
    options?: EntityRemoteOptions,
): MonoTypeOperatorFunction<T | T[]> => (
    source: Observable<T | T[]>,
): Observable<T | T[]> => source.pipe(
    filter((storeValue) => !options?.single || isNil(storeValue)),
);

export const getPaginated$ = <T>(
    dataSource: Observable<T[]> | Response$Factory<T[]>,
    pagination: Pagination,
): Observable<PaginatedResponse<T>> => getObservable$(dataSource, pagination).pipe(
    map((response) => ({ ...pagination, response })),
);

export const getMergedChanges = <T>(
    state: EntityInstanceState<T>,
    onlyStable?: boolean,
): EntityInstanceState<T> => {
    let { actual, changes = [] } = state;
    if (changes.length === 0) return state;
    let change: EntityChange<T> | undefined;

    while ((change = changes[0])) {
        if (onlyStable && !change.stable) break;
        changes = changes.slice(1);
        const { merge, patch } = change;
        actual = merge ? mergeFn(actual, patch) : patch;
    }

    if (changes.length === 0) return { actual };
    return { actual, changes: changes };
};

export const createEntityChange = <T>(
    patch: DeepPartial<T>,
    stable = false,
    merge = true,
    id?: string,
): EntityChange<T> => ({ patch, stable, merge, id });
