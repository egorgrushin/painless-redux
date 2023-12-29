import { createActionTypes, hashIt, typedDefaultsDeep } from '../utils';
import {
    EntityActionTypes,
    EntitySchema,
    EntityType,
    PaginatedResponse,
    Pagination,
    Response$Factory,
    ResponseArray,
} from './types';
import { DEFAULT_PAGE_SIZE, ENTITY_TYPE_NAMES, MAX_PAGES_COUNT } from './constants';
import { v4 } from 'uuid';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getObservable$ } from '../shared/utils';

export const getHash = (config: unknown): string => hashIt(config);

export const getFullEntitySchema = <T>(
    schema?: Partial<EntitySchema<T>>,
): EntitySchema<T> => typedDefaultsDeep(schema, {
    name: '',
    hashFn: getHash,
    pageSize: DEFAULT_PAGE_SIZE,
    maxPagesCount: MAX_PAGES_COUNT,
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

export const getPaginated$ = <T, TPageMetadata>(
    dataSource: Observable<ResponseArray<T, TPageMetadata>> | Response$Factory<T, TPageMetadata>,
    pagination: Pagination,
): Observable<PaginatedResponse<T, TPageMetadata>> => getObservable$(dataSource, pagination).pipe(
    map((response) => ({ ...pagination, response })),
);
