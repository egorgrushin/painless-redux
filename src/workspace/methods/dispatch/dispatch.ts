import { Dispatcher } from '../../../dispatcher/types';
import { WorkspaceActions } from '../../actions';
import { WorkspaceActionTypes } from '../../types';
import { DispatchWorkspaceMethods } from './types';
import { DeepPartial } from '../../../system-types';
import { SelectWorkspaceMethods } from '../select/types';
import { getHeadedActionName, snapshot } from '../../../utils';
import { ChangeActionOptions } from '../../../shared/change/types';

export const createDispatchWorkspaceMethods = <T>(
    dispatcher: Dispatcher<WorkspaceActionTypes, WorkspaceActions>,
    selectMethods: SelectWorkspaceMethods<T>,
    name: string,
): DispatchWorkspaceMethods<T> => {

    const change = (
        patch: DeepPartial<T> | ((value: DeepPartial<T> | undefined) => DeepPartial<T>),
        label: string,
        options?: ChangeActionOptions,
    ) => {
        if (typeof patch === 'function') {
            const oldValue$ = selectMethods.get$();
            const oldValue = snapshot(oldValue$);
            patch = patch(oldValue as unknown as DeepPartial<T>);
        }
        label = getHeadedActionName(name, label);
        return dispatcher.createAndDispatch('CHANGE', [patch, label, options]);
    };


    return { change };
};
