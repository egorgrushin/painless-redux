import { UndoOptions } from '../shared/system/types';
import { SystemActions } from '../shared/system/actions';
import { AnyAction } from '../system-types';

export interface Dispatcher<TActionTypes, TActions> {
    dispatch(action: TActions): void;

    createAndDispatch(
        actionName: keyof TActionTypes,
        args: any[],
        options?: any,
    ): TActions;

    undo(
        actionToUndo: AnyAction,
        options?: UndoOptions,
    ): SystemActions;
}
