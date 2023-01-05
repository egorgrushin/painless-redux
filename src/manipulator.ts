import { isNil } from 'lodash';
import { Observable } from 'rxjs';
import { createLoadingStatesByIdSelector } from './selectors';
import { IAffectState, IBaseSchema, Id, IDictionary, IEntityActionOptions, ILoadingState } from './types';
import { affectStateFactory } from './utils';
import { Slot } from './slot';
import * as actionCreators from './action-creators/actor';

export abstract class Manipulator<S extends IBaseSchema> extends Slot<S> {

	protected constructor(schema?: S) {super(schema);}

	setState(isLoading: boolean, config?: any, error?: any, options?: IEntityActionOptions) {
		this.createAndDispatch('setState', [config, null, { isLoading, error }, null], options);
	}

	setStateById(id: Id, isLoading: boolean, error?: any, options?: IEntityActionOptions) {
		this.createAndDispatch('setState', [null, id, { isLoading, error }, null], options);
	}

	setStateForKey(id: Id, key: string, isLoading: boolean, error?: any, options: IEntityActionOptions = {}) {
		this.createAndDispatch('setState', [null, id, { isLoading, error }, key], options);
	}

	removeState(id: Id, options: IEntityActionOptions = {}) {
		this.createAndDispatch('removeState', [id], options);
	}

	getState$(): Observable<ILoadingState> {
		return this.select(this.selectors.loadingStates.global);
	}

	getStates$(): Observable<IDictionary<ILoadingState>> {
		return this.select(this.selectors.loadingStates.byIds);
	}

	getStateById$(id: Id, isAsap?: boolean): Observable<ILoadingState> {
		const selector = createLoadingStatesByIdSelector(this.selectors.loadingStates.byIds, id);
		return this.select(selector, isAsap);
	}

	affectState(config?: any, key?: string, rethrow?: boolean) {
		return affectStateFactory<IAffectState>(this.stateSetter.bind(this))({
			config,
			id: null,
			key,
		}, rethrow);
	}

	affectStateById(id?: Id, key?: string, rethrow?: boolean) {
		return affectStateFactory<IAffectState>(this.stateSetter.bind(this))({
			config: null,
			id,
			key,
		}, rethrow);
	}

	affectStateByConfigOrId(config?: any, id?: Id, key?: string, rethrow?: boolean) {
		return affectStateFactory<IAffectState>(this.stateSetter.bind(this))({
			config,
			id,
			key,
		}, rethrow);
	}

	protected stateSetter(
		isLoading: boolean,
		args: { config?: null, id?: Id, key?: string },
		error?: { message: string },
	) {
		const errorMessage = error && error.message;
		if (!isNil(args.id)) {
			if (!isNil(args.key)) {
				this.setStateForKey(args.id, args.key, isLoading, errorMessage);
			} else {
				this.setStateById(args.id, isLoading, errorMessage);
			}
		} else {
			if (error) {
				console.error(error);
			}
			this.setState(isLoading, args.config, errorMessage);
		}
	}

	protected getActionTypes(): string[] {
		return [
			'ADD',
			'ADD_LIST',
			'REMOVE',
			'CHANGE',
			'REPLACE',
			'SET_STATE',
			'REMOVE_STATE',
		];
	}

	protected getActionCreators() {
		return actionCreators;
	}
}
