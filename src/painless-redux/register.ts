import { PainlessReduxRegister, SlotTypes } from './types';
import isNil from 'lodash/isNil';
import { AnyAction, Reducer } from '../system-types';

export const createRegister = () => {
    const value: PainlessReduxRegister = {
        [SlotTypes.Entity]: {},
        [SlotTypes.Workspace]: {},
    };

    const checkSlotUniq = (
        type: SlotTypes,
        name: string,
    ) => {
        const existSlotReducer = value[type][name];
        if (isNil(existSlotReducer)) return;
        throw new Error('Slot name is not uniq');
    };

    const addNewSlotToRegister = <TState, TActions extends AnyAction>(
        type: SlotTypes,
        name: string,
        reducer: Reducer<TState, TActions>,
    ) => {
        value[type] = {
            ...value[type],
            [name]: reducer as Reducer<any, AnyAction>,
        };
        return value;
    };


    return { addNewSlotToRegister, checkSlotUniq, value };
};
