import { Observable } from 'rxjs';

export type Dictionary<T> = Record<string, T>;

export type Id = string | number;

export interface LoadingState<E = string> {
    byKeys?: Dictionary<LoadingState>;
    isLoading: boolean;
    error?: E;
}

export interface RxStore<T = any> extends Observable<T> {
    dispatch(action: { type: any }): void;

    addReducer(
        key: string,
        reducer: any,
    ): void;
}

export interface AnyAction {
    type: string;
}

export interface PayloadAction<T = any> {
    type: string;
    payload: T;
}

export type Reducer<S, A extends AnyAction> = (
    state: S,
    action: A,
) => S;

export type CombinedReducers<TState> = {
    [K in keyof TState]: Reducer<TState[K], any>;
}

export type ActionCreator<TActionTypes, TActions> = (...args: any) => TActions;

export type HashFn = (ob: any) => string;
export type IdFn<T> = (data: T) => Id

export type SameShaped<T, V> = {
    [K in keyof T]: V
}

type Key = string | number | symbol;
export type StrictDictionary<K extends Key,
    V,
    K2 extends Key = string,
    > = Record<K, V> & Record<K2, V>;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T[P] extends ReadonlyArray<infer U>
            ? ReadonlyArray<DeepPartial<U>>
            : DeepPartial<T[P]>
};







