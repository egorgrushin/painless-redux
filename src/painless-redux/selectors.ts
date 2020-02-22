import { PainlessReduxSchema, PainlessReduxState, SlotTypes } from './types';
import { createSelector, Selector } from 'reselect';
import { Dictionary, StrictDictionary } from '../system-types';

export const createEntitiesSelector = (
    schema: PainlessReduxSchema,
    selector: Selector<any, PainlessReduxState>,
) => createSelector(
    selector,
    (state: PainlessReduxState) => state[schema.entityDomainName],
);

export const createWorkspacesSelector = (
    schema: PainlessReduxSchema,
    selector: Selector<any, PainlessReduxState>,
) => createSelector(
    selector,
    (state: PainlessReduxState) => state[schema.workspaceDomainName],
);

const SLOTS_SELECTOR_FACTORIES: StrictDictionary<SlotTypes, any> = {
    [SlotTypes.Entity]: createEntitiesSelector,
    [SlotTypes.Workspace]: createWorkspacesSelector,
};

export const createSlotsSelector = (
    schema: PainlessReduxSchema,
    selector: Selector<any, PainlessReduxState>,
) => <TState>(
    type: SlotTypes,
): Selector<PainlessReduxState, Dictionary<TState>> => {
    const slotSelectorFactory = SLOTS_SELECTOR_FACTORIES[type];
    return slotSelectorFactory(schema, selector);
};

export const createSlotSelector = <TState>(
    slotsSelector: Selector<PainlessReduxState, Dictionary<TState>>,
    name: string,
): Selector<PainlessReduxState, TState> => createSelector(
    slotsSelector,
    (state) => state[name],
);
