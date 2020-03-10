import { PainlessRedux, PainlessReduxSchema, SlotTypes } from './types';
import { ActionCreator, AnyAction, Reducer, RxStore, SameShaped } from '../system-types';
import { createDispatcher } from '../dispatcher/dispatcher';
import { typedDefaultsDeep } from '../utils';
import { createSlotSelector, createSlotsSelector } from './selectors';
import { getUndoableReducer } from './reducers';
import { createSelectManager } from '../select-manager/select-manager';
import { createRegister } from './register';
import { createSelector } from 'reselect';
import { createSystemActionTypes } from './utils';
import { createSystemActionCreators } from './action-creators';

export const createPainlessRedux = (
    rxStore: RxStore,
    schema?: Partial<PainlessReduxSchema>,
): PainlessRedux => {
    const fullSchema = typedDefaultsDeep(schema, {
        name: '@store',
        entityDomainName: 'entities',
        workspaceDomainName: 'workspaces',
        useAsapSchedulerInLoadingGuards: true,
        selector: (state: any) => state,
    }) as PainlessReduxSchema;

    const domainName = fullSchema.name;
    const initialValue = {};

    const selector = createSelector(fullSchema.selector, (state: any) => state[domainName]);
    const slotsSelector = createSlotsSelector(fullSchema, selector);
    const systemActionTypes = createSystemActionTypes(domainName);
    const systemActionCreators = createSystemActionCreators(systemActionTypes);

    const { value: register, checkSlotUniq, addNewSlotToRegister } = createRegister();
    const getReducer = () => getUndoableReducer(fullSchema, register, systemActionTypes, initialValue);

    const registerSlotReducer = <TState, TActions extends AnyAction>(
        type: SlotTypes,
        name: string,
        reducer: Reducer<TState, TActions>,
    ) => {
        checkSlotUniq(type, name);
        addNewSlotToRegister<TState, TActions>(type, name, reducer);
        const fullReducer = getReducer();
        rxStore.addReducer(domainName, fullReducer);
    };

    const registerSlot = <TState, TActionTypes, TActions extends AnyAction>(
        type: SlotTypes,
        name: string,
        reducer: Reducer<TState, TActions>,
        actionCreators: SameShaped<TActionTypes, ActionCreator<TActionTypes, TActions>>,
    ) => {
        const dispatcher = createDispatcher<TActionTypes, TActions>(rxStore, actionCreators, systemActionCreators);
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
        name: domainName,
        schema: fullSchema,
    };
};
