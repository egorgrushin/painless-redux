import { Dispatcher } from '../../../dispatcher/types';
import { WorkspaceActions } from '../../actions';
import { WorkspaceActionTypes } from '../../types';
import { DispatchWorkspaceMethods } from './types';
import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { SelectWorkspaceMethods } from '../select/types';
import { getHeadedActionName } from '../../../utils';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';
import { LoadingStateSetOptions } from '../../../shared/loading-state/types';
import { normalizePatch } from '../../../shared/change/utils';

export const createDispatchWorkspaceMethods = <T>(
    dispatcher: Dispatcher<WorkspaceActionTypes, WorkspaceActions>,
    selectMethods: SelectWorkspaceMethods<T>,
    name: string,
): DispatchWorkspaceMethods<T> => {

    const changeWithId = (
        patch: PatchRequest<T>,
        label: string,
        changeId?: string,
        options?: ChangeOptions,
    ) => {
        const normalizedPatch = normalizePatch(patch, selectMethods.get$());
        label = getHeadedActionName(name, label);
        return dispatcher.createAndDispatch('CHANGE', [normalizedPatch, label, changeId, options]);
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
        patch: PatchRequest<T>,
        label: string,
        options?: ChangeOptions,
    ) => {
        return changeWithId(patch, label, undefined, options);
    };

    const setLoadingState = (
        state: LoadingState,
        key?: string,
        options?: LoadingStateSetOptions,
    ) => {
        return dispatcher.createAndDispatch('SET_LOADING_STATE', [state, key], options);
    };

    const batch = (
        actions: WorkspaceActions[],
    ) => {
        return dispatcher.createAndDispatch('BATCH', [actions]);
    };

    return { changeWithId, setLoadingState: setLoadingState, change, resolveChange, batch };
};
