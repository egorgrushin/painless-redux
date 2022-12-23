import {
	camelCase,
	capitalize,
	clone,
	forEach,
	isArray,
	isNil,
	isPlainObject,
	lowerCase,
	toPath,
	updateWith,
} from 'lodash';
import { mergeWith } from 'lodash/fp';
import { v4 } from 'uuid';
import { IEntityActionOptions, IStoreAction, SelectResult } from './types';
import { EMPTY, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { MD5 } from 'crypto-js';
import { MD5 as objectMD5 } from 'object-hash';

export const toCamelCase = (snakeCaseObject) => {
	if (isArray(snakeCaseObject)) {
		return snakeCaseObject.map(val => toCamelCase(val));
	}
	if (isPlainObject(snakeCaseObject)) {
		return Object.keys(snakeCaseObject).reduce((memo, key) => {
			memo[camelCase(key)] = toCamelCase(snakeCaseObject[key]);
			return memo;
		}, {});
	}
	return snakeCaseObject;
};

export const toTitleCase = (camelCaseObject) => {
	const titleCaseObject = {};
	forEach(camelCaseObject, (value: any, key: any) => {
		// checks that a checked is a plain object or an array - for recursive key conversion
		if (isPlainObject(value) || isArray(value)) {
			// recursively update keys of any values that are also objects
			value = toTitleCase(value);
		}
		const newKey = typeof key === 'number' ? key : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
		titleCaseObject[newKey] = value;
	});
	return titleCaseObject;
};

export const merge = (obj, newValue, crutch?) => {
	return mergeWith((objValue, srcValue, key, object) => {
		if (Array.isArray(objValue) && Array.isArray(srcValue)) {
			return srcValue;
		}
		// TODO(disavel1) temporary crutch for 21 release
		if (srcValue === undefined && crutch) {
			object[key] = undefined;
		}
	}, obj, newValue);
};

export const update = (obj, newValue, options: IEntityActionOptions) => {
	if (options.merge && isPlainObject(obj)) {
		return merge(obj, newValue, options.crutch);
	}
	return newValue;
};

export const updateAtPath = (obj, path, newValue, options: IEntityActionOptions = { merge: true }) => {
	if (isNil(path)) {
		if (isNil(newValue)) return obj;
		return update(obj, newValue, options);
	}
	if (newValue === undefined) {
		return removeAtPath(obj, path);
	}
	return updateWith({ ...obj }, path, (targetValue) =>
		update(targetValue, newValue, options), clone);
};

export const removeAtPath = (obj, path) => {
	const arrayPath = toPath(path);
	const key = arrayPath.slice(-1)[0];
	const pathToKey = arrayPath.slice(0, -1);
	if (pathToKey.length === 0) {
		return removeByKey(obj, key);
	}
	return updateWith({ ...obj }, pathToKey, (targetValue) => removeByKey(targetValue, key), clone);
};

export const removeByKey = (obj, key) => {
	if (Array.isArray(obj)) {
		const index = parseInt(key, 10);
		return [
			...obj.slice(0, index),
			...obj.slice(index + 1),
		];
	}
	const { [key]: deleted, ...rest } = obj;
	return rest;
};

export const controlId = (entity) => {
	if (isNil(entity.id)) {
		entity.id = v4();
	}
	return entity;
};

type AffectStateFactorySetter<IArgsType> = (
	isLoading: boolean,
	args?: IArgsType,
	error?: { message: string },
	value?: any,
	isInterrupted?: boolean,
) => void;

// TODO(yrgrushi): remove curring function approach
export const affectStateFactory = <IArgsType>(stateSetter: AffectStateFactorySetter<IArgsType>) => (
	argumentsToSetter?: IArgsType,
	rethrow: boolean = true,
) => (...observableOrPipes) => {
	const obs = observableOrPipes[0] as Observable<any>;
	const isObs = obs instanceof Observable;
	const pipeFactory = affectStatePipeFactory<IArgsType>(stateSetter)(argumentsToSetter, rethrow);
	if (!isObs) return (pipeFactory as any)(...observableOrPipes);
	return of(null).pipe(pipeFactory(switchMap(() => obs)));
};

export const affectStatePipeFactory = <IArgsType>(stateSetter: AffectStateFactorySetter<IArgsType>) => (
	argumentsToSetter?: IArgsType,
	rethrow: boolean = true,
) =>
	(...pipes: Array<OperatorFunction<any, any>>): OperatorFunction<any, any> =>
		(source: Observable<any>) => {
			let stateCleared: boolean;
			return (source as any).pipe(
				tap(() => {
					stateSetter(true, argumentsToSetter);
					stateCleared = false;
				}),
				switchMap((value) => (of(value) as any).pipe(
					...pipes,
					catchError((error: Error) => {
						stateSetter(false, argumentsToSetter, error, undefined, true);
						stateCleared = true;
						return rethrow ? throwError(error) : EMPTY;
					}),
				)),
				tap((value) => {
					stateSetter(false, argumentsToSetter, null, value);
					stateCleared = true;
				}),
				finalize(() => {
					if (stateCleared) return;
					stateSetter(false, argumentsToSetter, null, undefined, true);
				}),
			);
		};

export const hashIt = (value?: any) => {
	if (typeof value === 'string') return hashString(value);
	if (isNil(value)) value = {};
	return objectMD5(value);
};

export const hashString = (value: string) => MD5(value).toString();

export const capitalizeAll = (str: string) => lowerCase(str).split(' ').map((part) => capitalize(part)).join(' ');

export const maskObject = <T, M>(obj: T, mask: M): SelectResult<T, M> => {
	if (isNil(obj || isNil(mask))) return obj as unknown as SelectResult<T, M>;
	return Object.keys(obj).reduce((memo, key: string) => {
		let value = obj[key];
		const maskValue = mask[key];
		if (!maskValue) return memo;
		if (typeof maskValue === 'object') {
			value = maskObject(value, maskValue);
		}
		memo[key] = value;
		return memo;
	}, {}) as SelectResult<T, M>;
};

export const actionSanitizer = (action: IStoreAction) => ({
	...action,
	_type: action.type,
	type: action.label || action.type,
});

export const select = <S, R>(selector: (value: S, index: number) => R) =>
	(source: Observable<S>) => source.pipe(
		map<S, R>(selector),
		distinctUntilChanged(),
	);
