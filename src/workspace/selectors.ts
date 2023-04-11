import { createSelector, Selector } from 'reselect';
import { PainlessReduxState } from '../painless-redux/types';
import { WorkspaceSelectors, WorkspaceState } from './types';
import { createLoadingStateSelector } from '../shared/loading-state/selectors';
import { getChangeableActual } from '../shared/change/selectors';

export const createWorkspaceValueSelector = <T>(
    selector: Selector<PainlessReduxState, WorkspaceState<T>>,
) => createSelector(
    selector,
    (workspace: WorkspaceState<T>) => getChangeableActual(workspace.value),
);

export const createWorkspaceSelectors = <T>(
    selector: Selector<PainlessReduxState, WorkspaceState<T>>,
): WorkspaceSelectors<T> => {
    const actual = createWorkspaceValueSelector(selector);
    const loadingState = createLoadingStateSelector<WorkspaceState<T>>(selector);

    return {
        actual,
        loadingState,
    };
};
