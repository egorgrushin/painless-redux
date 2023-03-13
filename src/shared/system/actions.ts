import { typedDefaultsDeep } from '../../utils';
import { SystemActionTypes, UndoOptions } from './types';
import { AnyAction } from '../../system-types';

export const createUndo = (types: SystemActionTypes) => (
    action: AnyAction,
    options?: UndoOptions,
) => {
    options = typedDefaultsDeep(options);
    const payload = { action };
    return { type: types.UNDO, payload, options } as const;
};

export type SystemActions = ReturnType<ReturnType<typeof createUndo>>
