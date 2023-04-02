import { createActionTypes, typedDefaultsDeep } from '../utils';
import { WORKSPACE_TYPE_NAMES } from './constants';
import { SelectResult, WorkspaceActionTypes, WorkspaceSchema } from './types';
import { isNil } from 'lodash';
import { WorkspaceActions, WorkspaceChangeAction } from './actions';
import { AnyAction } from '../system-types';


export const getFullWorkspaceSchema = <T>(
    schema?: Partial<WorkspaceSchema<T>>,
): WorkspaceSchema<T> => typedDefaultsDeep(schema, {
    initialValue: undefined,
}) as WorkspaceSchema<T>;

export const createWorkspaceActionTypes = (workspaceName: string): WorkspaceActionTypes => {
    return createActionTypes(WORKSPACE_TYPE_NAMES, workspaceName);
};


// export const maskObject = <T extends any, M extends any>(obj: T, mask: M): SelectResult<T, M> => {
//     if (isNil(obj || isNil(mask))) return obj as unknown as SelectResult<T, M>;
//     return Object.keys(obj).reduce((memo: any, key: string) => {
//         let value = obj[key];
//         const maskValue = mask[key];
//         if (!maskValue) return memo;
//         if (typeof maskValue === 'object') {
//             value = maskObject(value, maskValue);
//         }
//         memo[key] = value;
//         return memo;
//     }, {}) as SelectResult<T, M>;
// };


export const actionSanitizer = (action: WorkspaceChangeAction) => ({
    ...action,
    _type: action.type,
    type: action.label || action.type,
});
