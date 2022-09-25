import { BATCH_ACTIONS, UNDO_ACTION } from '../action-creators/system';
import { IStoreAction } from '../types';

export const undoReducerFactory = (initialState, bufferSize) => {
	let executedActions: any[] = [];
	let baseState: any = initialState;
	return (reducer) => {
		return (state, action: IStoreAction) => {
			if (action.type === UNDO_ACTION) {
				executedActions = executedActions.filter(eAct => eAct !== action.payload);
				// update the state for every action until we get the
				// exact same state as before, but without the action we want to rollback
				return executedActions.reduce(reducer, baseState);
			} else {
				executedActions.push(action);
				if (executedActions.length === bufferSize) {
					const actionToCommit = executedActions.shift();
					baseState = reducer(baseState, actionToCommit);
				}
				return reducer(state, action);
			}
		};
	};
};

export const batchActionsReducerFactory = <T>() => (reducer: (state: any, action: IStoreAction) => any) => (
	state: T,
	action: IStoreAction,
): T => {
	if (action.type === BATCH_ACTIONS) {
		return action.payload.reduce(reducer, state);
	}
	return reducer(state, action);
};
