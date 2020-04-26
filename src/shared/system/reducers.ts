import { AnyAction, Reducer } from '../../system-types';
import { SystemActionTypes } from './types';

export const batchActionsReducerFactory = <TState, TAction extends AnyAction>(
    types: SystemActionTypes,
    reducer: Reducer<TState, TAction>,
) => (state: TState, action: TAction): TState => {
    if (action.type === types.BATCH) {
        const { actions } = (action as any).payload;
        return actions.reduce(reducer, state);
    }
    return reducer(state, action);
};
