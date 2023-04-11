import * as changeActions from '../shared/change/actions';
import { LoadingStateActions } from '../shared/loading-state/actions';
import { ChangeOptions } from '../shared/change/types';
import { WorkspaceActionTypes } from './types';
import { DeepPartial } from '../system-types';

export const createChange = <T>(types: WorkspaceActionTypes) => (
    patch: DeepPartial<T>,
    label: string,
    changeId?: string,
    options?: ChangeOptions,
) => {
    const actionCreator = changeActions.createChange(types);
    const action = actionCreator(patch, changeId, options);
    return { ...action, label } as const;
};

export const createResolveChange = <T>(types: WorkspaceActionTypes) => (
    label: string,
    changeId: string,
    success: boolean,
    remotePatch?: DeepPartial<T>,
    options?: ChangeOptions,
) => {
    const actionCreator = changeActions.createResolveChange(types);
    const action = actionCreator(changeId, success, remotePatch, options);
    return { ...action, label } as const;
};

type SelfActions = ReturnType<typeof createChange>
    | ReturnType<typeof createResolveChange>;

export type WorkspaceChangeAction = ReturnType<SelfActions>

export type WorkspaceActions = ReturnType<SelfActions> | LoadingStateActions

