import { ActionCreator, AnyAction, RxStore, SameShaped } from '../system-types';
import { Dispatcher } from './types';

const createCreateAction = <TActionTypes, TActions>(
    actionCreators: SameShaped<TActionTypes, ActionCreator<TActionTypes, TActions>>,
) => (
    actionName: keyof TActionTypes,
    args: any[],
    options?: any,
): TActions => {
    const actionCreator = actionCreators[actionName];
    return actionCreator(...args, options);
};

export const createDispatcher = <TActionTypes, TActions extends AnyAction>(
    rxStore: RxStore,
    actionCreators: SameShaped<TActionTypes, ActionCreator<TActionTypes, TActions>>,
): Dispatcher<TActionTypes, TActions> => {
    const dispatch = (action: AnyAction): void => rxStore.dispatch(action);
    const createAction = createCreateAction(actionCreators);

    const createAndDispatch = (
        actionName: keyof TActionTypes,
        args: any[],
        options?: any,
    ): TActions => {
        const action = createAction(actionName, args, options);
        dispatch(action);
        return action;
    };

    return {
        dispatch,
        createAndDispatch,
    };
};
