import { asapScheduler, Observable } from 'rxjs';
import { defaultsDeep } from 'lodash';

import { subscribeOn, take } from 'rxjs/operators';
import { IBaseSchema, IEntityActionEnhancedOptions, IRxStore, StoreActionTypes } from './types';
import { capitalizeAll, hashIt, select } from './utils';
import { StoreLib } from './store';

export abstract class Slot<S extends IBaseSchema = IBaseSchema> {
	store: StoreLib;
	actionCreators: any;
	actionTypes: StoreActionTypes;
	rxStore: IRxStore<any>;
	protected _selector: (state: any) => any;
	protected selectors;

	set selector(selector: any) {
		this._selector = selector;
		this.buildSelectors(selector);
	}

	get name() { return this.schema.name; }

	protected constructor(protected schema?: S) {
		this.schema = defaultsDeep(schema, {}) as S;
		this.createActionTypes();
		this.createActionCreators();
	}

	abstract getReducer();

	protected dispatch(action) {
		this.rxStore.dispatch(action);
	}

	protected select<R>(selector, isAsap?: boolean): Observable<R> {
		const selectObs = this.rxStore.pipe(
			select<any, R>(selector),
		);
		if (!isAsap) return selectObs;
		return selectObs.pipe(subscribeOn(asapScheduler));
	}

	protected snapshot<T>(selector): T {
		return this.snapshotFromObs<T>(this.select(selector));
	}

	protected snapshotFromObs<T>(obs: Observable<T>): T {
		let value;
		obs.pipe(take(1)).subscribe((v) => value = v);
		return value;
	}

	protected createAndDispatch(actionName: string, params: any[], options?: IEntityActionEnhancedOptions) {
		const action = this.createAction(actionName, params, options);
		this.dispatch(action);
		return action;
	}

	protected createAction(actionName: string, params: any[], options?: IEntityActionEnhancedOptions) {
		return this.actionCreators[actionName](...params, options);
	}

	protected generateFullActionName(typeName: string, actionName: string) {
		const actionString = capitalizeAll(actionName);
		const typeString = capitalizeAll(typeName);
		return `[${typeString}] ${actionString}`;
	}

	protected getHash(config?) {
		return hashIt(config);
	}

	protected abstract getActionTypes(): string[];

	protected abstract buildSelectors(selector: any): void;

	protected abstract getActionCreators(): object;

	private createActionTypes() {
		const typeNames = this.getActionTypes();
		this.actionTypes = typeNames.reduce((memo, actionName) => {
			memo[actionName] = this.generateFullActionName(this.name, actionName);
			return memo;
		}, {});
	}

	private createActionCreators() {
		const actionCreators = this.getActionCreators();
		if (!actionCreators) return;
		this.actionCreators = Object.keys(actionCreators).reduce((memo, key) => {
			memo[key] = actionCreators[key](this.actionTypes);
			return memo;
		}, {});
	}
}
