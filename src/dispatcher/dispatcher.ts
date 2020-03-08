import { ActionCreator, AnyAction, RxStore, SameShaped } from '../system-types';
import { Dispatcher } from './types';
import { SystemActions } from '../shared/system/actions';
import { SystemActionTypes, UndoOptions } from '../shared/system/types';


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
    systemActionCreators: SameShaped<SystemActionTypes, ActionCreator<SystemActionTypes, SystemActions>>,
): Dispatcher<TActionTypes, TActions> => {
    const dispatch = (action: AnyAction): void => rxStore.dispatch(action);
    const createAction = createCreateAction(actionCreators);
    const createSystemAction = createCreateAction(systemActionCreators);

    const createAndDispatch = (
        actionName: keyof TActionTypes,
        args: any[],
        options?: any,
    ): TActions => {
        const action = createAction(actionName, args, options);
        dispatch(action);
        return action;
    };

    const undo = (
        actionToUndo: AnyAction,
        options?: UndoOptions,
    ): SystemActions => {
        const action = createSystemAction('UNDO', [actionToUndo], options);
        dispatch(action);
        return action;
    };


    return {
        dispatch,
        createAndDispatch,
        undo,
    };
};
