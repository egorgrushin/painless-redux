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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getObservable$ } from '../shared/utils';
import { Id } from '../system-types';
import { isNil } from 'lodash-es';

export const getHash = (config: unknown): string => hashIt(config);
export const getId = <T>(data: T): Id => (data as any).id;

export const getFullEntitySchema = <T>(
    schema?: Partial<EntitySchema<T>>,
): EntitySchema<T> => typedDefaultsDeep(schema, {
    name: '',
    hashFn: getHash,
    pageSize: DEFAULT_PAGE_SIZE,
    maxPagesCount: MAX_PAGES_COUNT,
    id: getId,
}) as EntitySchema<T>;

export const createIdResolver = <T>(
    schema: EntitySchema<T>,
) => (data: T, forceId?: Id): Id => {
    const id = forceId ?? schema.id(data);
    if (isNil(id)) throw new Error(
        'Entity data must have the key. By default library gets the key from \'id\' property.' +
        'It can be changed by EntitySchema.id() property calling \'createEntity\'.');
    return id;
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
