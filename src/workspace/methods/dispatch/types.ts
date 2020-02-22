import { DeepPartial } from '../../../system-types';
import { ChangeActionOptions } from '../../../shared/change/types';
import { WorkspaceActions } from '../../actions';

export interface DispatchWorkspaceMethods<T> {
    change: (
        patch: DeepPartial<T> | ((value: DeepPartial<T> | undefined) => DeepPartial<T>),
        label: string,
        options?: ChangeActionOptions,
    ) => WorkspaceActions;
}
