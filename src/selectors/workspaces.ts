import { createSelector } from '@ngrx/store';

export const createWorkspaceValueSelector = (selector) => createSelector(selector, (workspace: any) => workspace.value);
