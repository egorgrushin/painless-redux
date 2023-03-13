import { PayloadAction, Reducer } from '../../system-types';
import { SystemActionTypes } from './types';

export const undoReducerFactory = <TState, TActions extends PayloadAction>(
    types: SystemActionTypes,
    initialState: TState,
) => {
    let executedActions: TActions[] = [];
    return (
        reducer: Reducer<TState, TActions>,
    ) => (
        state: any,
        action: TActions,
    ) => {
        if (action.type === types.UNDO) {
            executedActions = executedActions.filter((eAct: TActions) => eAct !== action.payload);
            // update the state for every action until we get the
            // exact same state as before, but without the action we want to rollback
            return executedActions.reduce(reducer, initialState);
        }
        executedActions.push(action);
        return reducer(state, action);
    };
};
