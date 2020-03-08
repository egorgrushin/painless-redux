import { PainlessReduxRegister, PainlessReduxSchema, PainlessReduxState, SlotTypes } from './types';
import { AnyAction, PayloadAction, Reducer } from '../system-types';
// @ts-ignore
import * as combineReducers from 'combine-reducers';
import { SystemActionTypes } from '../shared/system/types';
import { undoReducerFactory } from '../shared/system/system';

export const getSlotReducer = (
    register: PainlessReduxRegister,
    type: SlotTypes,
): Reducer<any, AnyAction> => {
    const slots = register[type];
    return combineReducers(slots);
};

export const createFullReducer = (
    schema: PainlessReduxSchema,
    register: PainlessReduxRegister,
): Reducer<PainlessReduxState, AnyAction> => combineReducers({
    [schema.entityDomainName]: getSlotReducer(register, SlotTypes.Entity),
    [schema.workspaceDomainName]: getSlotReducer(register, SlotTypes.Workspace),
});

export const getUndoableReducer = (
    schema: PainlessReduxSchema,
    register: PainlessReduxRegister,
    types: SystemActionTypes,
    initialState: PainlessReduxState,
): Reducer<PainlessReduxState, PayloadAction> => {
    const reducer = createFullReducer(schema, register);
    const reducerMiddlewareFactory = undoReducerFactory(types, initialState);
    return reducerMiddlewareFactory(reducer);
};
