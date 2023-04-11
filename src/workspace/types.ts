import { ChangeableState, ChangeActionTypes } from '../shared/change/types';
import { LoadingStateActionTypes, LoadingStateSelectors, LoadingStateState } from '../shared/loading-state/types';
import { Selector } from 'reselect';
import { SelectWorkspaceMethods } from './methods/select/types';
import { DispatchWorkspaceMethods } from './methods/dispatch/types';
import { WorkspaceActionCreators } from './action-creators';
import { MixedWorkspaceMethods } from './methods/mixed/types';

export type PublicDispatchWorkspaceMethods<T> = Omit<DispatchWorkspaceMethods<T>, 'changeWithId' | 'resolveChange'>

export type Workspace<T> = {
    actionCreators: WorkspaceActionCreators;
} & PublicDispatchWorkspaceMethods<T> & SelectWorkspaceMethods<T> & MixedWorkspaceMethods<T>;

export interface WorkspaceState<T> extends LoadingStateState {
    value: ChangeableState<T>;
}

export interface WorkspaceSchema<T> {
    name: string;
    initialValue?: T;
}

export interface WorkspaceActionTypes extends ChangeActionTypes {
    SET_STATE: LoadingStateActionTypes['SET_STATE'];
}

export type ValueSelector<T> = Selector<WorkspaceState<T>, T | undefined>;

export interface WorkspaceSelectors<T> extends LoadingStateSelectors<WorkspaceState<T>> {
    actual: ValueSelector<T>;
}

export type BooleanMap<T> = {
    [K in keyof T]?: T[K] extends object
        ? boolean | BooleanMap<T[K]>
        : boolean
};
export type SelectValue<T, M> = M extends boolean ? T : SelectResult<T, M>;
export type SelectResult<T, M extends BooleanMap<T>> = { [K in (keyof M & keyof T)]: SelectValue<T[K], M[K]> };
