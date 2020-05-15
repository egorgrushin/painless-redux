import { DeepPartial } from '../../system-types';
import { RequestOptions } from '../types';

export interface ChangeOptions extends RequestOptions {
    merge?: boolean;
    ifNotExist?: boolean;
    optimistic?: boolean;
    useResponsePatch?: boolean;
}

export interface ChangeActionTypes {
    CHANGE: 'CHANGE';
    RESOLVE_CHANGE: 'RESOLVE_CHANGE';
}

export interface Change<T> {
    stable: boolean;
    patch: DeepPartial<T>;
    merge: boolean;
    id?: string;
}

export interface ChangeableState<T> {
    actual: T;
    changes?: Change<T>[];
}

export type PatchRequest<T> = DeepPartial<T> | ((value: DeepPartial<T> | undefined) => DeepPartial<T>);
