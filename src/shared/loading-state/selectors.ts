import { createSelector, Selector } from 'reselect';
import { LoadingStateState } from './types';

export const createLoadingStateSelector = <T extends LoadingStateState>(
    selector: Selector<any, T>,
) => createSelector(
    selector,
    (workspace: T) => workspace.loadingState,
);
