import { defaultsDeep, isNil, keyBy } from 'lodash';
import { combineReducers, createSelector } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ForeignKeyArray } from './foreign-keys';
import { Manipulator } from './manipulator';
import {
	createByIdSelector,
	createDictionarySelector,
	createIdsSelector,
	createLoadingStatesByIdsSelector,
	createLoadingStatesGlobalSelector,
	createPageDomainSelector,
	createPageIdsSelector,
	createPageLoadingStateSelector,
	createPagesSelector,
} from './selectors';

import { BASE_PAGE_SIZE, IActorSchema, Id, IEntityActionOptions, IForeignKey, ILoadingState, IPage } from './types';
import { createDictionaryReducer } from './reducers/dictionaryFactory';
import { createIdsReducer } from './reducers/idsFactory';
import { createPagesReducer } from './reducers/pagesFactory';
import { createLoadingStatesReducer } from './reducers/loadingStatesFactory';

export class Actor<T extends object = object, S extends IActorSchema = IActorSchema> extends Manipulator<S> {

	constructor(schema: IActorSchema) {
		super(defaultsDeep(schema, {
			related: {},
			pageSize: BASE_PAGE_SIZE,
		}));
	}

	change(
		id: Id,
		value: any,
		path?: number | string | Array<string | number> | undefined | null,
		options?: IEntityActionOptions,
	) {
		this.createAndDispatch('change', [id, value, path], options);
	}

	getAll() {
		return this.select(this.selectors.all);
	}

	getByIdsDenormalizedSelector(ids: Id[]): any {
		const related = this.getRelatedConfig();
		return createSelector(this.selectors.dictionary, s => s, (dict, state) => {
			return this.denormalizeArray(ids, dict, state, related);
		});
	}

	getPageIdsSelector(config: any): any {
		const hash = this.getHash(config);
		return createPageIdsSelector(this.selectors.pages, hash);
	}

	getPageDomainSelector(config: any): any {
		const hash = this.getHash(config);
		return createPageDomainSelector(this.selectors.pages, hash);
	}

	getPageLoadingStateSelector(config: any) {
		const hash = this.getHash(config);
		return createPageLoadingStateSelector(this.selectors.pages, hash);
	}

	getByIdDenormalizedSelector(id: Id): any {
		const related = this.getRelatedConfig();
		const thisSelector = createByIdSelector(this.selectors.dictionary, id);
		return createSelector(thisSelector, s => s, (thisEntity, state) => {
			return this.denormalize(thisEntity, state, related);
		});
	}

	getPurePageItems<R>(config: any, options?: IEntityActionOptions): Observable<R> {
		const pageIdsSelector = this.getPageIdsSelector(config);
		const selector = createSelector(pageIdsSelector, this.selectors.dictionary, (ids: Id[], dict) => {
			if (!ids) return undefined;
			const entities = ids.map(id => dict[id]);
			if (options && options.asDict) return keyBy(entities, 'id');
			return entities;
		});
		return this.select(selector);
	}

	// TODO avoid s => s selector
	getPageItems<R>(config: any, options?: IEntityActionOptions): Observable<R> {
		if (this.isRelatedConfigEmpty()) {
			return this.getPurePageItems<R>(config, options);
		}
		// TODO add support asDict option
		const pageSelector = this.getPageIdsSelector(config);
		const related = this.getRelatedConfig();
		const selector = createSelector(pageSelector, this.selectors.dictionary, s => s,
			(ids: Id[], dict, state) => {
				if (!ids) return undefined;
				return this.denormalizeArray(ids, dict, state, related);
			},
		);
		return this.select(selector);
	}

	getPage(config: any): Observable<IPage> {
		const selector = this.getPageDomainSelector(config);
		return this.select(selector);
	}

	getPageState(config: any, isAsap?: boolean): Observable<ILoadingState> {
		const selector = this.getPageLoadingStateSelector(config);
		return this.select(selector, isAsap);
	}

	getPureFromDictionaryById(id: Id): Observable<any> {
		const selector = createByIdSelector(this.selectors.dictionary, id);
		return this.select(selector);
	}

	getFromDictionaryById(id: Id) {
		if (this.isRelatedConfigEmpty()) {
			return this.getPureFromDictionaryById(id);
		}
		const selector = this.getByIdDenormalizedSelector(id);
		return this.select(selector);
	}

	purify(entity: Actor) {
		return Object.keys(this.schema.related).reduce((memo, key) => {
			const foreignKey = this.schema.related[key] as IForeignKey;
			const isForeignKeyArray = foreignKey instanceof ForeignKeyArray;
			const related = entity[key];
			if (related) {
				entity[key] = isForeignKeyArray ? related.map(e => e.id) : related.id;
			}
			return memo;
		}, entity);
	}

	getReducer() {
		return combineReducers({
			dictionary: createDictionaryReducer(this.actionTypes),
			ids: createIdsReducer(this.actionTypes),
			loadingStates: createLoadingStatesReducer(this.actionTypes),
			pages: createPagesReducer(this.actionTypes),
		});
	}

	protected isRelatedConfigEmpty() {
		return Object.keys(this.schema.related).length === 0;
	}

	protected denormalizeArray(ids: Id[], dict, state, related) {
		return ids.map(id => dict[id]).map(entity => this.denormalize(entity, state, related));
	}

	protected denormalize(entity: any, state: any, related: any) {
		if (isNil(entity)) return;
		const denormalized = { ...entity };
		return Object.keys(related)
			.filter(key => !isNil(denormalized[key]))
			.reduce((memo, relatedEntityName) => {
				const relatedSelectorCreator = related[relatedEntityName];
				const relatedSelector = relatedSelectorCreator(memo[relatedEntityName]);
				Object.defineProperty(memo, relatedEntityName, {
					get() {
						return relatedSelector(state);
					},
				});
				return memo;
			}, denormalized);
	}

	protected buildSelectors(selector: any) {
		this.selectors = {};
		this.selectors.ids = createIdsSelector(selector);
		this.selectors.dictionary = createDictionarySelector(selector);
		this.selectors.pages = createPagesSelector(selector);
		this.selectors.loadingStates = {
			global: createLoadingStatesGlobalSelector(selector),
			byIds: createLoadingStatesByIdsSelector(selector),
		};
		this.selectors.all = createSelector(
			this.selectors.ids,
			this.selectors.dictionary,
			(ids: any[], dictionary: any) => ids.reduce((memo, id) => {
				const entity = dictionary[id];
				if (entity) {
					memo.push(entity);
				}
				return memo;
			}, []),
		);
	}

	private getRelatedConfig() {
		return Object.keys(this.schema.related).reduce((memo, entityName) => {
			const foreignKey = this.schema.related[entityName] as IForeignKey;
			const relatedActor = this.store.getSlotByName(foreignKey.to) as Actor;
			const selectorCreator = foreignKey instanceof ForeignKeyArray
				? relatedActor.getByIdsDenormalizedSelector
				: relatedActor.getByIdDenormalizedSelector;
			memo[entityName] = selectorCreator.bind(relatedActor);
			return memo;
		}, {});
	}
}
