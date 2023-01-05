import 'jest';
import { cold } from 'jest-marbles';
import { Workspace } from './workspace';
import { registerSlotsInStore } from './testing/helpers';
import { TestStore } from './testing/store';
import { capitalizeAll } from './utils';

interface ITestWorkspace {
	fill?: boolean;
	color?: {
		red?: number;
		green?: number;
		blue?: number;
	};
	values?: number[];
}

describe('Workspace', () => {

	let workspace: Workspace<ITestWorkspace>;
	let store: TestStore<any>;
	let initialValue: ITestWorkspace;
	let noLabel: string;

	beforeEach(() => {
		store = new TestStore();
		initialValue = {
			fill: true,
			color: { red: 0, green: 0, blue: 0 },
			values: [1, 2, 3],
		};
		workspace = new Workspace<ITestWorkspace>({ name: 'test', initialValue });
		noLabel = '[Test] ';
		registerSlotsInStore(store, [workspace]);
	});

	describe('#get$', () => {
		test('should return observable by string selector', () => {
			// arrange
			const expected$ = cold('a', { a: initialValue.color.red });
			// act
			const actual = workspace.get$('color', 'red');
			// assert
			expect(actual).toBeObservable(expected$);
		});

		test('should return observable with origin value by empty selector', () => {
			// arrange
			const expected$ = cold('a', { a: initialValue });
			// act
			const actual = workspace.get$();
			// assert
			expect(actual).toBeObservable(expected$);
		});
	});

	describe('#getByMap$', () => {
		test('should return observable to workspace', () => {
			// arrange
			const expected$ = cold('a', { a: initialValue });
			// act
			const actual = workspace.getByMap$();
			// assert
			expect(actual).toBeObservable(expected$);
		});

		test('should return observable to masked workspace', () => {
			// arrange
			const expected$ = cold('a', {
				a: { color: { red: initialValue.color.red } },
			});
			// act
			const actual = workspace.getByMap$({ color: { red: true } });
			// assert
			expect(actual).toBeObservable(expected$);
		});
	});

	describe('#change', () => {
		test('should change workspace value', () => {
			// arrange
			const patch = { color: { blue: 255 } };
			const action = workspace.actionCreators.change(patch, noLabel);
			const expected$ = cold('a', { a: action });
			// act
			workspace.change(patch, undefined);
			// assert
			expect(store.actions$).toBeObservable(expected$);
		});

		test('should change workspace value based on previous', () => {
			// arrange
			const action = workspace.actionCreators.change({ color: { blue: 1 } }, noLabel);
			const expected$ = cold('a', {
				a: action,
			});
			// act
			workspace.change((previous) => ({
				color: { blue: previous.color.blue + 1 },
			}), undefined);
			// assert
			expect(store.actions$).toBeObservable(expected$);
		});

		test('should set upper cased label for action', () => {
			// arrange
			const action = workspace.actionCreators.change(null, `[Test] Some Label`);
			const expected$ = cold('a', { a: action });
			// act
			workspace.change(null, 'some label');
			// assert
			expect(store.actions$).toBeObservable(expected$);
		});
	});

});
