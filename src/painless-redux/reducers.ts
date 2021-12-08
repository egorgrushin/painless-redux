import { PainlessReduxRegister, PainlessReduxSchema, PainlessReduxState, SlotTypes } from './types';
import { AnyAction, PayloadAction, Reducer } from '../system-types';
import { combineReducers } from '../shared/utils';
import { SystemActionTypes } from '../shared/system/types';

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

export const getWrappedReducer = (
    schema: PainlessReduxSchema,
    register: PainlessReduxRegister,
    types: SystemActionTypes,
    initialState: PainlessReduxState,
): Reducer<PainlessReduxState, PayloadAction> => {
    return createFullReducer(schema, register);
    // const reducerMiddlewareFactory = undoReducerFactory(types, initialState);
    // return reducerMiddlewareFactory(reducer);
};
