import { defaultsDeep, isArray, values } from 'lodash';
import { createDomainSelector, createLoadingStatesGlobalSelector, createSlotSelector } from './selectors';
import { IDictionary, IRxStore, IStoreSchema, StoreActionTypes, Type } from './types';
import * as combineReducers  from 'combine-reducers';
import { Slot } from './slot';
import { createLoadingStateReducer } from './reducers/loadingStateFactory';
import { Entity } from './entity';
import { Workspace } from './workspace';

export class StoreLib extends Slot<IStoreSchema> {
	private slots: IDictionary<Slot> = {};
	private registeredActionTypes = {};

	private slotDomainsMap: IDictionary<Type<Slot>> = {};

	constructor(rxStore: IRxStore<any>, schema?: IStoreSchema) {
		super(defaultsDeep(schema, {
			name: '@store',
			entityDomainName: 'entities',
			workspaceDomainName: 'workspaces',
			domainSelector: (state) => state,
		}));
		this.rxStore = rxStore;
		this.buildSlotDomainsMap();
		this.registerSlot(this, true);
	}

	registerSlots(slots: Slot | Slot[]) {
		slots = (isArray(slots) ? slots : [slots]) as Slot[];
		slots.forEach((slot) => this.registerSlot(slot));
		const reducer = this.getReducer();
		this.rxStore.addReducer(this.schema.name, reducer);
	}

	getSlotByName(name: string): Slot {
		const resultKey = Object.keys(this.slots).find((key) => key.toLowerCase() === name.toLowerCase());
		return this.slots[resultKey];
	}

	getReducer() {
		return combineReducers({
			[this.schema.entityDomainName]: this.getSubReducer(Entity),
			[this.schema.workspaceDomainName]: this.getSubReducer(Workspace),
			loadingStates: combineReducers({
				global: createLoadingStateReducer(this.actionTypes),
			}),
		});
	}

	protected registerSlot(slot: Slot, itself = false) {
		slot.rxStore = this.rxStore;
		slot.store = this;
		let domainSelector = this.schema.domainSelector;
		if (!itself) {
			const slotDomainKey = this.getDomainKeyForSlot(slot);
			domainSelector = this.selectors[slotDomainKey];
			this.slots[slot.name] = slot;
		}
		slot.selector = createSlotSelector(domainSelector, slot.name);
		this.registerActionTypes(slot.actionTypes);
	}

	protected buildSelectors(selector) {
		this.selectors = {
			[this.schema.entityDomainName]: createDomainSelector(selector, this.schema.entityDomainName),
			[this.schema.workspaceDomainName]: createDomainSelector(selector, this.schema.workspaceDomainName),
			loadingStates: {
				global: createLoadingStatesGlobalSelector(selector),
			},
		};
	}

	protected getActionTypes(): string[] {
		return ['SET_STATE'];
	}

	protected getActionCreators(): object {
		return undefined;
	}

	private getSubReducer(slotType: Type<Slot>) {
		const slots = this.getSlotsByType(slotType);
		const reducersMap = slots.reduce((memo, slot) => {
			memo[slot.name] = slot.getReducer();
			return memo;
		}, {});
		return combineReducers(reducersMap);
	}

	private registerActionTypes(types: StoreActionTypes) {
		values(types).forEach((actionName: string) => this.registerActionType(actionName));
	}

	private registerActionType(actionName: string) {
		if (this.registeredActionTypes[actionName]) {
			// FIXME(egorgrushin):
			// console.warn(`Action type "${actionName}" is not unique`);
			return;
		}
		this.registeredActionTypes[actionName] = true;
	}

	private getSlotsByType(slotType: Type<Slot>) {
		return this.getSlots().filter((slot) => slot instanceof slotType);
	}

	private getSlots() {
		return values(this.slots);
	}

	private getDomainKeyForSlot(slot: Slot) {
		return Object.keys(this.slotDomainsMap).find((key) => slot instanceof this.slotDomainsMap[key]);
	}

	private buildSlotDomainsMap() {
		this.slotDomainsMap = {
			[this.schema.entityDomainName]: Entity,
			[this.schema.workspaceDomainName]: Workspace,
		};
	}
}
