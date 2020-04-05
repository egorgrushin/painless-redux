import { DeepPartial, Id, LoadingState } from '../../../system-types';
import { ChangeOptions } from '../../../shared/change/types';
import { WorkspaceActions } from '../../actions';
import { LoadingStateSetOptions } from '../../../shared/loading-state/types';

export interface DispatchWorkspaceMethods<T> {
    change: (
        patch: DeepPartial<T> | ((value: DeepPartial<T> | undefined) => DeepPartial<T>),
        label: string,
        options?: ChangeOptions,
    ) => WorkspaceActions;
    changeWithId: (
        patch: DeepPartial<T> | ((value: DeepPartial<T> | undefined) => DeepPartial<T>),
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
    setState: (
        state: LoadingState,
        key?: string,
        options?: LoadingStateSetOptions,
    ) => WorkspaceActions;
    batch: (
        actions: WorkspaceActions[],
    ) => WorkspaceActions;
}
