import { createSelector, Selector } from 'reselect';
import { PainlessReduxState } from '../painless-redux/types';
import { WorkspaceSelectors, WorkspaceState } from './types';
import { createLoadingStateSelector } from '../shared/loading-state/selectors';


export const createWorkspaceValueSelector = <T>(
    selector: Selector<PainlessReduxState, WorkspaceState<T>>,
) => createSelector(
    selector,
    (workspace: WorkspaceState<T>) => workspace.value,
);

export const createWorkspaceSelectors = <T>(
    selector: Selector<PainlessReduxState, WorkspaceState<T>>,
): WorkspaceSelectors<T> => {
    const value = createWorkspaceValueSelector(selector);
    const loadingState = createLoadingStateSelector<WorkspaceState<T>>(selector);

    return {
        value,
        loadingState,
    };
};
