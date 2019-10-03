import { Observable } from 'rxjs';
import { BooleanMap, DeepPartial, ILoadingState, IWorkspaceSchema, SelectResult } from './types';
import { Slot } from './slot';
import * as actionCreators from './action-creators/workspaces';
import * as combineReducers from 'combine-reducers';
import { createLoadingStateReducer } from './reducers/loadingStateFactory';
import { createLoadingStateByKeySelector, createLoadingStateSelector } from './selectors';
import { createWorkspaceValueReducer } from './reducers/worspaceFactories';
import { createWorkspaceValueSelector } from './selectors/workspaces';
import { map, pluck } from 'rxjs/operators';
import { affectStateFactory, maskObject } from './utils';

export class Workspace<T> extends Slot<IWorkspaceSchema<T>> {
	constructor(schema: IWorkspaceSchema<T>) { super(schema); }

	getByMap$(): Observable<T>;
	getByMap$<M extends BooleanMap<T>>(selectMap: M): Observable<SelectResult<T, M>>;
	getByMap$<M extends BooleanMap<T>>(selectMap?: M): Observable<SelectResult<T, M>> | Observable<T> {
		const obs = this.select(this.selectors.value);
		if (!selectMap) return obs as Observable<T>;
		return obs.pipe(map((value: T) => maskObject(value, selectMap))) as Observable<SelectResult<T, M>>;
	}

	getByMap(): T;
	getByMap<M>(selectMap: M): SelectResult<T, M>;
	getByMap<M>(selectMap?: M): SelectResult<T, M> | T {
		return this.snapshotFromObs(this.getByMap$(selectMap));
	}

	change(patch: DeepPartial<T> | ((value: DeepPartial<T>) => DeepPartial<T>), label: string) {
		if (typeof patch === 'function') {
			const oldValue = this.get();
			patch = patch(oldValue);
		}
		label = this.generateFullActionName(this.name, label);
		this.createAndDispatch('change', [patch, label]);
	}

	getState(key?: string): Observable<ILoadingState> {
		let selector = this.selectors.loadingState;
		if (key) {
			selector = createLoadingStateByKeySelector(this.selectors.loadingState, key);
		}
		return this.select(selector);
	}

	affectState(key?: string, rethrow?: boolean) {
		return affectStateFactory<{ key: string }>(this.stateSetter.bind(this))({ key }, rethrow);
	}

	setState(state: ILoadingState, key?: string) {
		this.createAndDispatch('setState', [null, null, state, key]);
	}

	getReducer() {
		return combineReducers({
			value: createWorkspaceValueReducer(this.actionTypes, this.schema.initialValue),
			loadingStates: createLoadingStateReducer(this.actionTypes),
		});
	}

	get$(): Observable<T>
	get$<A extends keyof T,
		V extends T[A],
		>(a: A): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		V extends T[A][B],
		>(a: A, b: B): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		V extends T[A][B][C],
		>(a: A, b: B, c: C): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		V extends T[A][B][C][D],
		>(a: A, b: B, c: C, d: D): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		V extends T[A][B][C][D][E],
		>(a: A, b: B, c: C, d: D, e: E): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		V extends T[A][B][C][D][E][F],
		>(a: A, b: B, c: C, d: D, e: E, f: F): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		V extends T[A][B][C][D][E][F][G],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		H extends keyof T[A][B][C][D][E][F][G],
		V extends T[A][B][C][D][E][F][G][H],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		H extends keyof T[A][B][C][D][E][F][G],
		I extends keyof T[A][B][C][D][E][F][G][H],
		V extends T[A][B][C][D][E][F][G][H][I],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I): Observable<V>
	get$<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		H extends keyof T[A][B][C][D][E][F][G],
		I extends keyof T[A][B][C][D][E][F][G][H],
		J extends keyof T[A][B][C][D][E][F][G][H][I],
		V extends T[A][B][C][D][E][F][G][H][I][J],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J): Observable<V>
	get$(...args: string[]): Observable<T> {
		const obs = this.select<T>(this.selectors.value);
		if (args.length === 0) return obs;
		return obs.pipe(pluck(...args));
	}

	get(): T
	get<A extends keyof T,
		V extends T[A],
		>(a: A): V
	get<A extends keyof T,
		B extends keyof T[A],
		V extends T[A][B],
		>(a: A, b: B): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		V extends T[A][B][C],
		>(a: A, b: B, c: C): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		V extends T[A][B][C][D],
		>(a: A, b: B, c: C, d: D): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		V extends T[A][B][C][D][E],
		>(a: A, b: B, c: C, d: D, e: E): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		V extends T[A][B][C][D][E][F],
		>(a: A, b: B, c: C, d: D, e: E, f: F): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		V extends T[A][B][C][D][E][F][G],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		H extends keyof T[A][B][C][D][E][F][G],
		V extends T[A][B][C][D][E][F][G][H],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		H extends keyof T[A][B][C][D][E][F][G],
		I extends keyof T[A][B][C][D][E][F][G][H],
		V extends T[A][B][C][D][E][F][G][H][I],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I): V
	get<A extends keyof T,
		B extends keyof T[A],
		C extends keyof T[A][B],
		D extends keyof T[A][B][C],
		E extends keyof T[A][B][C][D],
		F extends keyof T[A][B][C][D][E],
		G extends keyof T[A][B][C][D][E][F],
		H extends keyof T[A][B][C][D][E][F][G],
		I extends keyof T[A][B][C][D][E][F][G][H],
		J extends keyof T[A][B][C][D][E][F][G][H][I],
		V extends T[A][B][C][D][E][F][G][H][I][J],
		>(a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J): V
	get(...args: string[]) {
		const obs = this.get$.call(this, ...args);
		return this.snapshotFromObs(obs);
	}

	protected stateSetter(isLoading: boolean, args: { key: string }, error?: { message: string }) {
		this.setState({ isLoading, error }, args.key);
	}

	protected buildSelectors(selector: any): void {
		this.selectors = {
			value: createWorkspaceValueSelector(selector),
			loadingState: createLoadingStateSelector(selector),
		};
	}

	protected getActionTypes(typeName?: string): string[] {
		return [
			'CHANGE',
			'SET_STATE',
		];
	}

	protected getActionCreators() {
		return actionCreators;
	}
}
