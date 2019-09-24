import 'jest';
import { cold } from 'jest-marbles';
import { Workspace } from './workspace';
import { registerSlotsInStore } from './testing/helpers';
import { TestStore } from './testing/store';

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
	let store: TestStore<any>;
	let initialValue: ITestWorkspace;

	beforeEach(() => {
		store = new TestStore();
		initialValue = {
			fill: true,
			color: { red: 0, green: 0, blue: 0 },
		};
		workspace = new Workspace<ITestWorkspace>({ name: 'test', initialValue });
		registerSlotsInStore(store, [workspace]);

	});

	describe('#get$', () => {
		test('should return observable to workspace', () => {
			// arrange
			const expected$ = cold('a', { a: initialValue });
			// act
			const actual = workspace.get$();
			// assert
			expect(actual).toBeObservable(expected$);
		});

		test('should return observable to masked workspace', () => {
			// arrange
			const expected$ = cold('a', {
				a: { color: { red: initialValue.color.red } },
			});
			// act
			const actual = workspace.get$({ color: { red: true } });
			// assert
			expect(actual).toBeObservable(expected$);
		});
	});

	describe('#change', () => {
		test('should change workspace value', () => {
			// arrange
			const patch = { color: { blue: 255 } };
			const label = 'some label';
			const action = workspace.actionCreators.change(patch, `[Test] Some Label`);
			const expected$ = cold('a', {
				a: action,
			});
			// act
			workspace.change(patch, label);
			// assert
			expect(store.actions$).toBeObservable(expected$);
		});

		test('should change workspace value based on previous', () => {
			// arrange
			const label = 'some label';
			const action = workspace.actionCreators.change({ color: { blue: 1 } }, `[Test] Some Label`);
			const expected$ = cold('a', {
				a: action,
			});
			// act
			workspace.change((previous) => ({
				color: { blue: previous.color.blue + 1 },
			}), label);
			// assert
			expect(store.actions$).toBeObservable(expected$);
		});
	});

});
