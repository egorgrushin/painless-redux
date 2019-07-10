import { StoreLib } from './store';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StoreLibConnectingModule } from './store-connecting.module';
import { combineReducers, Store } from '@ngrx/store';
import { cold } from 'jest-marbles';
import { Workspace } from './workspace';

interface ITestWorkspace {
	fill?: boolean;
	color?: {
		red?: number;
		green?: number;
		blue?: number;
	};
}

describe('Workspace', () => {

	let workspace: Workspace<ITestWorkspace>;
	let store: MockStore<any>;
	let storeLib: StoreLib;
	let initialValue: ITestWorkspace;
	let reducer: any;

	beforeEach(() => {
		initialValue = {
			fill: true,
			color: { red: 0, green: 0, blue: 0 },
		};
		workspace = new Workspace<ITestWorkspace>({ name: 'test', initialValue });
		TestBed.configureTestingModule({
			imports: [StoreLibConnectingModule.forRoot({ slots: [workspace] })],
			providers: [provideMockStore()],
		});

		store = TestBed.get(Store);
		storeLib = TestBed.get(StoreLib);
		// emulating addReducer, because MockStore doesn't add
		const storeLibReducer = storeLib.getReducer();
		reducer = combineReducers({ [storeLib.name]: storeLibReducer });
		const state = reducer({}, { type: 'any' });
		store.setState(state);
	});

	describe('#get$', () => {
		test('should return observable to workspace', () => {
			// arrange
			const storeObs = cold('a', { a: initialValue });
			// act
			const actual = workspace.get$();
			// assert
			expect(actual).toBeObservable(storeObs);
		});

		test('should return observable to masked workspace', () => {
			// arrange
			const storeObs = cold('a', {
				a: { color: { red: initialValue.color.red } },
			});
			// act
			const actual = workspace.get$({ color: { red: true } });
			// assert
			expect(actual).toBeObservable(storeObs);
		});
	});

	describe('#change', () => {
		test('should change workspace value', () => {
			// arrange
			const patch = { color: { blue: 255 } };
			const label = 'some label';
			const action = workspace.actionCreators.change(patch, `[Test] Some Label`);
			const actions$ = cold('a', {
				a: action,
			});
			// act
			workspace.change(patch, label);
			// assert
			expect(store.scannedActions$).toBeObservable(actions$);
		});

		test('should change workspace value based on previous', () => {
			// arrange
			const label = 'some label';
			const action = workspace.actionCreators.change({ color: { blue: 1 } }, `[Test] Some Label`);
			const actions$ = cold('a', {
				a: action,
			});
			// act
			workspace.change((previous) => ({
				color: { blue: previous.color.blue + 1 },
			}), label);
			// assert
			expect(store.scannedActions$).toBeObservable(actions$);
		});
	});

});
