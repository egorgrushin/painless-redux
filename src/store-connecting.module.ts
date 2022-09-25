import { Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoreLib } from './store';
import { IStoreSchema } from './types';
import { Slot } from './slot';

const INITIAL_SLOTS_TOKEN = new InjectionToken<Slot[]>('INITIAL_SLOTS_TOKEN');
const CHILDREN_SLOTS_TOKEN = new InjectionToken<Slot[]>('CHILDREN_SLOTS_TOKEN');

@NgModule({})
class StoreLibChildrenConnectingModule {
	constructor(
		storeLib: StoreLib,
		rxStore: Store<any>,
		@Inject(CHILDREN_SLOTS_TOKEN) slots: Slot[],
	) {
		storeLib.connect(rxStore, slots);
	}
}

@NgModule({})
class StoreLibInitialConnectingModule {
	constructor(
		rxStore: Store<any>,
		store: StoreLib,
		@Inject(INITIAL_SLOTS_TOKEN) slots: Slot[],
	) {
		store.connect(rxStore, slots);
	}
}

@NgModule({})
export class StoreLibConnectingModule {

	static forRoot({ schema, slots }: { schema?: IStoreSchema; slots?: Slot[] }): ModuleWithProviders {
		return {
			ngModule: StoreLibInitialConnectingModule,
			providers: [
				{
					provide: StoreLib,
					useFactory: () => new StoreLib(schema),
				},
				{
					provide: INITIAL_SLOTS_TOKEN,
					useValue: slots,
				},
			],
		};
	}

	static forChild(slots: Slot[]): ModuleWithProviders {
		return {
			ngModule: StoreLibChildrenConnectingModule,
			providers: [
				{
					provide: CHILDREN_SLOTS_TOKEN,
					useValue: slots,
				},
			],
		};
	}
}
