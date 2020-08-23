import md5 from 'md5-hash';
import { MD5 as objectMD5 } from 'object-hash';
import { mergeWith } from 'lodash/fp';
import { capitalize, defaultsDeep, keyBy, lowerCase } from 'lodash';
import { Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { DeepPartial, Dictionary } from './system-types';

export const capitalizeAll = (str: string | number | symbol): string =>
    lowerCase(str.toString()).split(' ').map((part: string) => capitalize(part)).join(' ');

export const hashString = (value: string): string => md5(value).toString();

export const hashIt = (value?: unknown): string => {
    if (typeof value === 'string') return hashString(value);
    return objectMD5(value ?? {});
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
    obj: T,
    newValue: DeepPartial<T>,
): T => mergeWith((
    objValue,
    srcValue,
    key,
    object,
) => {
    if (Array.isArray(objValue) && Array.isArray(srcValue)) return srcValue;
    // solution for undefined values proposed by https://github.com/savelucky
    if (srcValue === undefined) {
        object[key] = undefined;
    }
}, obj, newValue);

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
