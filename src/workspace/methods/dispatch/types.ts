import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';
import { WorkspaceActions } from '../../actions';
import { LoadingStateSetOptions } from '../../../shared/loading-state/types';

export interface DispatchWorkspaceMethods<T> {
    change: (
        patch: PatchRequest<T>,
        label: string,
        options?: ChangeOptions,
    ) => WorkspaceActions;
    changeWithId: (
        patch: PatchRequest<T>,
        label: string,
        changeId?: string,
        options?: ChangeOptions,
    ) => WorkspaceActions;
    resolveChange: (
        label: string,
        changeId: Id,
        success: boolean,
        remotePatch?: DeepPartial<T>,
        options?: ChangeOptions,
    ) => WorkspaceActions;
    setLoadingState: (
        state: LoadingState,
        key?: string,
        options?: LoadingStateSetOptions,
    ) => WorkspaceActions;
    batch: (
        actions: WorkspaceActions[],
    ) => WorkspaceActions;
}
