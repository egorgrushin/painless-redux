import { Observable } from 'rxjs';
import { BooleanMap, ILoadingState, IWorkspaceSchema, DeepPartial, SelectResult } from './types';
import { Slot } from './slot';
import * as actionCreators from './action-creators/workspaces';
import { combineReducers } from '@ngrx/store';
import { createLoadingStateReducer } from './reducers/loadingStateFactory';
import { createLoadingStateByKeySelector, createLoadingStateSelector } from './selectors';
import { createWorkspaceValueReducer } from './reducers/worspaceFactories';
import { createWorkspaceValueSelector } from './selectors/workspaces';
import { map } from 'rxjs/operators';
import { affectStateFactory, maskObject } from './utils';

export class Workspace<T> extends Slot<IWorkspaceSchema<T>> {
	constructor(schema: IWorkspaceSchema<T>) { super(schema); }

	get$(): Observable<T>;
	get$<M extends BooleanMap<T>>(selectMap: M): Observable<SelectResult<T, M>>;
	get$<M extends BooleanMap<T>>(selectMap?: M): Observable<SelectResult<T, M>> | Observable<T> {
		const obs = this.select(this.selectors.value);
		if (!selectMap) return obs as Observable<T>;
		return obs.pipe(map((value) => maskObject(value, selectMap))) as Observable<SelectResult<T, M>>;
	}

	get(): T;
	get<M>(selectMap: M): SelectResult<T, M>;
	get<M>(selectMap?: M): SelectResult<T, M> | T {
		return this.snapshotFromObs(this.get$(selectMap));
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
