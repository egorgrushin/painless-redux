import { SystemActionTypes } from '../shared/system/types';
import { createActionTypes } from '../utils';
import { SYSTEM_TYPE_NAMES } from './constants';


export const createSystemActionTypes = (
    name: string,
): SystemActionTypes => createActionTypes(SYSTEM_TYPE_NAMES, name);
