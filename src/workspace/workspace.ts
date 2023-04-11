import { PainlessRedux, SlotTypes } from '../painless-redux/types';
import { Workspace, WorkspaceActionTypes, WorkspaceSchema, WorkspaceState } from './types';
import { WorkspaceActions } from './actions';
import { createWorkspaceActionTypes, getFullWorkspaceSchema } from './utils';
import { createWorkspaceActionCreators } from './action-creators';
import { createWorkspaceReducer } from './reducer';
import { createWorkspaceSelectors } from './selectors';
import { createSelectWorkspaceMethods } from './methods/select/select';
import { createDispatchWorkspaceMethods } from './methods/dispatch/dispatch';
import { createWorkspaceMixedMethods } from './methods/mixed/mixed';

export const createWorkspace = <T>(
    pr: PainlessRedux,
    schema?: Partial<WorkspaceSchema<T>>,
): Workspace<T> => {
    const fullSchema = getFullWorkspaceSchema<T>(schema);
    const name = fullSchema.name;
    const actionTypes = createWorkspaceActionTypes(name);
    const actionCreators = createWorkspaceActionCreators<T>(actionTypes);
    const reducer = createWorkspaceReducer<T>(actionTypes, fullSchema.initialValue);
    const {
        selector,
        dispatcher,
        selectManager,
    } = pr.registerSlot<WorkspaceState<T>, WorkspaceActionTypes, WorkspaceActions>(
        SlotTypes.Workspace,
        name,
        reducer,
        actionCreators,
    );
    const selectors = createWorkspaceSelectors<T>(selector);

    const selectMethods = createSelectWorkspaceMethods<T>(selectManager, selectors);
    const dispatchMethods = createDispatchWorkspaceMethods<T>(dispatcher, selectMethods, name);
    const mixedMethods = createWorkspaceMixedMethods<T>(pr.schema, selectMethods, dispatchMethods);

    const { changeWithId, resolveChange, ...publicDispatchMethods } = dispatchMethods;

    return {
        ...publicDispatchMethods,
        ...selectMethods,
        ...mixedMethods,
        actionCreators,
    };
};
