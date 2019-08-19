import { createSelector } from 'reselect';

export const createWorkspaceValueSelector = (selector) => createSelector(selector, (workspace: any) => workspace.value);
