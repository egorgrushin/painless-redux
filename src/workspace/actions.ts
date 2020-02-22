import * as changeActions from '../shared/change/actions';
import { LoadingStateActions } from '../shared/loading-state/actions';
import { ChangeActionOptions } from '../shared/change/types';
import { WorkspaceActionTypes } from './types';


export const createChange = (types: WorkspaceActionTypes) => (
    patch: any,
    label: string,
    options?: ChangeActionOptions,
) => {
    const action = changeActions.createChange(types)(patch, options);
    return { ...action, label } as const;
};

export type WorkspaceChangeAction = ReturnType<ReturnType<typeof createChange>>;
export type WorkspaceActions = WorkspaceChangeAction | LoadingStateActions

