import { Dispatcher } from '../../../dispatcher/types';
import { WorkspaceActions } from '../../actions';
import { WorkspaceActionTypes } from '../../types';
import { DispatchWorkspaceMethods } from './types';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { SelectWorkspaceMethods } from '../select/types';
import { getHeadedActionName, snapshot } from '../../../utils';
import { ChangeOptions } from '../../../shared/change/types';
import { LoadingStateSetOptions } from '../../../shared/loading-state/types';

export const createDispatchWorkspaceMethods = <T>(
    dispatcher: Dispatcher<WorkspaceActionTypes, WorkspaceActions>,
    selectMethods: SelectWorkspaceMethods<T>,
    name: string,
): DispatchWorkspaceMethods<T> => {

    const changeWithId = (
        patch: DeepPartial<T> | ((value: DeepPartial<T> | undefined) => DeepPartial<T>),
        label: string,
        changeId?: string,
        options?: ChangeOptions,
    ) => {
        if (typeof patch === 'function') {
            const oldValue$ = selectMethods.get$();
            const oldValue = snapshot(oldValue$);
            patch = patch(oldValue as unknown as DeepPartial<T>);
        }
        label = getHeadedActionName(name, label);
        return dispatcher.createAndDispatch('CHANGE', [patch, label, changeId, options]);
    };

    const resolveChange = (
        label: string,
        changeId: Id,
        success: boolean,
        remotePatch?: DeepPartial<T>,
        options?: ChangeOptions,
    ) => {
        return dispatcher.createAndDispatch('RESOLVE_CHANGE', [label, changeId, success, remotePatch], options);
    };

    const change = (
        patch: DeepPartial<T> | ((value: DeepPartial<T> | undefined) => DeepPartial<T>),
        label: string,
        options?: ChangeOptions,
    ) => {
        return changeWithId(patch, label, undefined, options);
    };

    const setState = (
        state: LoadingState,
        key?: string,
        options?: LoadingStateSetOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_STATE', [state], options);
    };

    const batch = (
        actions: WorkspaceActions[],
    ) => {
        return dispatcher.createAndDispatch('BATCH', [actions]);
    };

    return { changeWithId, setState, change, resolveChange, batch };
};
