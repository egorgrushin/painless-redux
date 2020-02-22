import { createActionTypes, hashIt, typedDefaultsDeep } from '../utils';
import {
    EntityActionTypes,
    EntityInsertOptions,
    EntitySchema,
    ObservableOrFactory,
    PaginatedResponse,
    Pagination,
    Response$,
    Response$Factory,
} from './types';
import { isNil } from 'lodash';
import { DEFAULT_PAGE_SIZE, ENTITY_TYPE_NAMES } from './constants';
import { v4 } from 'uuid';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { LoadingState } from '../system-types';
import { filter, first, map } from 'rxjs/operators';

export const getHash = (config: any): string => hashIt(config);

export const getFullEntitySchema = <T>(
    schema?: Partial<EntitySchema<T>>,
): EntitySchema<T> => typedDefaultsDeep(schema, {
    hashFn: getHash,
    pageSize: DEFAULT_PAGE_SIZE,
}) as EntitySchema<T>;

export const createIdResolver = <T>(schema: EntitySchema<T>) => (data: Partial<T>) => {
    if (schema.id) {
        data = { ...data, id: schema.id(data) };
    }
    return data;
};


export const controlId = (entity: any): any => {
    if (isNil(entity.id)) {
        entity.id = v4();
    }
    return entity;
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
    options?: EntityInsertOptions,
): MonoTypeOperatorFunction<T | T[]> => (
    source: Observable<T | T[]>,
): Observable<T | T[]> => source.pipe(
    filter((storeValue) => !options?.single || isNil(storeValue)),
);


export const getPaginated$ = <T>(
    dataSource: Response$<T[]> | Response$Factory<T[]>,
    pagination: Pagination,
): Observable<PaginatedResponse<Partial<T>>> => getObservable$(dataSource, pagination).pipe(
    map((response) => ({ ...pagination, response })),
);
