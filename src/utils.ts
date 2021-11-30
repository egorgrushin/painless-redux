import { MD5 } from 'object-hash';
import capitalize from 'lodash/capitalize';
import defaultsDeep from 'lodash/defaultsDeep';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import keyBy from 'lodash/keyBy';
import lowerCase from 'lodash/lowerCase';
import { Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { DeepPartial, Dictionary, Id } from './system-types';

export const capitalizeAll = (str: string | number | symbol): string =>
    lowerCase(str.toString()).split(' ').map((part: string) => capitalize(part)).join(' ');

export const hashString = (value: string): string => MD5(value).toString();

export const hashIt = (value?: unknown): string => {
    if (typeof value === 'string') return hashString(value);
    return MD5(value ?? {});
};

export const getHeadedActionName = (
    header: string,
    ...rest: string[]
) => {
    const actionString = capitalizeAll(rest.join(' '));
    const typeString = capitalizeAll(header);
    return `[${typeString}] ${actionString}`;
};

export const createActionTypes = <T>(
    actionTypeNames: (keyof T)[],
    entityName: string,
): T => {
    return actionTypeNames.reduce((
        memo: any,
        actionName: keyof T,
    ) => {
        memo[actionName] = getHeadedActionName(entityName, actionName as string);
        return memo;
    }, {});
};

export const merge = <T>(
    src: T,
    patch: DeepPartial<T>,
): T => {
    if (isNil(src)) return { ...patch } as T;
    const newObject: T = { ...src };
    for (const key in patch) {
        const srcValue = src[key];
        const patchValue = patch[key];
        if (patchValue === undefined) {
            delete newObject[key];
        } else if (isObject(patchValue) && !Array.isArray(patchValue)) {
            newObject[key] = merge(srcValue, patchValue as any);
        } else {
            (newObject[key] as unknown) = patchValue;
        }
    }
    return newObject;
};

export const typedDefaultsDeep = <T>(
    obj: Partial<T> | undefined,
    ...args: Partial<T>[]
): Partial<T> => defaultsDeep({}, obj, ...args) as Partial<T>;

export const snapshot = <T>(obs$: Observable<T>): T | undefined => {
    let value;
    obs$.pipe(take(1)).subscribe((v) => value = v);
    return value;
};

export const select = <T, R>(
    selector: (
        value: T,
        index: number,
    ) => R,
): OperatorFunction<T, R> => (
    source: Observable<T>,
): Observable<R> => source.pipe(
    map<T, R>((
        value: T,
        index: number,
    ) => selector(value, index)),
    distinctUntilChanged(),
);

export const toDictionary = <T>(
    key: string = 'id',
): OperatorFunction<T[] | undefined, Dictionary<T>> => (
    source: Observable<T[] | undefined>,
): Observable<Dictionary<T>> => source.pipe(
    map((values: T[] | undefined) => keyBy(values, key)),
);

export const removeFromArray = <T>(
    array: T[],
    itemsToRemove: T[],
): T[] => array.filter((item) => !itemsToRemove.includes(item));

export const removeFromObject = <T>(
    obj: Record<Id, T>,
    keysToRemove: Id[],
): Record<string, T> => keysToRemove.reduce((memo, key: Id) => {
    delete memo[key];
    return memo;
}, { ...obj });
