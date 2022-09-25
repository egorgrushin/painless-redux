/* tslint:disable:no-magic-numbers */
import { BATCH_ACTIONS, batchActionsReducerFactory, IStoreAction, UNDO_ACTION, undoReducerFactory } from '..';

describe('systemFactory', () => {

	const reducer = (state: number = 0, action: IStoreAction): number => {
		const value = action.payload.value;
		switch (action.type) {
			case 'ADD':
				return state + value;
			case 'SUBTRACT':
				return state - value;
			case 'MULTI':
				return state * value;
			case 'DIVIDE':
				return state / value;
			default:
				return state;
		}
	};

	const actions = [
		{ type: 'ADD', payload: { value: 5 } },
		{ type: 'SUBTRACT', payload: { value: 1 } },
		{ type: 'MULTI', payload: { value: 2 } },
		{ type: 'ADD', payload: { value: 7 } },
		{ type: 'DIVIDE', payload: { value: 3 } },
	];

	describe('undoReducerFactory', () => {
		let undoReducer;
		beforeEach(() => {
			undoReducer = undoReducerFactory(0, 5)(reducer);
		});

		test('it should undo action', () => {
			// arrange
			const state = actions.reduce(undoReducer, 0);
			const action = { type: UNDO_ACTION, payload: actions[2] };
			// act
			const actual = undoReducer(state, action);
			// assert
			const expected = (5 - 1 + 7) / 3;
			expect(actual).toEqual(expected);
		});
	});

	describe('batchActionsReducerFactory', () => {
		const batchReducer = batchActionsReducerFactory<number>()(reducer);

		test('should proceed several action at once', () => {
			// arrange
			const batchAction = { type: BATCH_ACTIONS, payload: actions };
			// act
			const actual = batchReducer(undefined, batchAction);
			// assert
			const expected = ((5 - 1) * 2 + 7) / 3;
			expect(actual).toEqual(expected);
		});

		test('should ignore if action.type is not equal BATCH_ACTIONS', () => {
			// arrange
			const action = { type: 'ANY', payload: {} };
			// act
			const actual = batchReducer(0, action);
			// assert
			expect(actual).toEqual(0);
		});
	});
});
