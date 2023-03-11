import { PainlessReduxRegister, PainlessReduxSchema, PainlessReduxState, SlotTypes } from './types';
import { AnyAction, Reducer } from '../system-types';
// @ts-ignore
import * as combineReducers from 'combine-reducers';


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
