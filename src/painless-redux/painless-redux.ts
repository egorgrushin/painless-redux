import { PainlessRedux, PainlessReduxSchema, SlotTypes } from './types';
import { ActionCreator, AnyAction, Reducer, RxStore, SameShaped } from '../system-types';
import { createDispatcher } from '../dispatcher/dispatcher';
import { typedDefaultsDeep } from '../utils';
import { createSlotSelector, createSlotsSelector } from './selectors';
import { createFullReducer } from './reducers';
import { createSelectManager } from '../select-manager/select-manager';
import { createRegister } from './register';
import { createSelector } from 'reselect';


export const createPainlessRedux = (
    rxStore: RxStore,
    schema?: Partial<PainlessReduxSchema>,
): PainlessRedux => {
    const fullSchema = typedDefaultsDeep(schema, {
        name: '@store',
        entityDomainName: 'entities',
        workspaceDomainName: 'workspaces',
        selector: (state: any) => state,
    }) as PainlessReduxSchema;

    const name = fullSchema.name;

    const selector = createSelector(fullSchema.selector, (state: any) => state[fullSchema.name]);
    const slotsSelector = createSlotsSelector(fullSchema, selector);

    const { value: register, checkSlotUniq, addNewSlotToRegister } = createRegister();
    const getReducer = () => createFullReducer(fullSchema, register);

    const registerSlotReducer = <TState, TActions extends AnyAction>(
        type: SlotTypes,
        name: string,
        reducer: Reducer<TState, TActions>,
    ) => {
        checkSlotUniq(type, name);
        addNewSlotToRegister<TState, TActions>(type, name, reducer);
        const fullReducer = getReducer();
        rxStore.addReducer(name, fullReducer);
    };

    const registerSlot = <TState, TActionTypes, TActions extends AnyAction>(
        type: SlotTypes,
        name: string,
        reducer: Reducer<TState, TActions>,
        actionCreators: SameShaped<TActionTypes, ActionCreator<TActionTypes, TActions>>,
    ) => {
        const dispatcher = createDispatcher<TActionTypes, TActions>(rxStore, actionCreators);
        const selectManager = createSelectManager(rxStore);
        const currentSlotsSelector = slotsSelector<TState>(type);
        const selector = createSlotSelector<TState>(currentSlotsSelector, name);
        registerSlotReducer<TState, TActions>(type, name, reducer);
        return {
            dispatcher,
            selector,
            selectManager,
        };
    };


    return {
        registerSlot,
        getReducer,
        name,
    };
};
