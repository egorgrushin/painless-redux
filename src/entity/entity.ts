import { Entity, EntityActionTypes, EntitySchema, EntityState } from './types';
import { createEntitySelectors } from './selectors';
import { PainlessRedux, SlotTypes } from '../painless-redux/types';
import { createEntityActionTypes, createIdResolver, getFullEntitySchema } from './utils';
import { createEntityReducer } from './reducer';
import { EntityActions } from './actions';
import { createDispatchEntityMethods } from './methods/dispatch/dispatch';
import { createEntityActionCreators } from './action-creators';
import { createSelectEntityMethods } from './methods/select/select';
import { createMixedEntityMethods } from './methods/mixed/mixed';

export const createEntity = <T>(
    pr: PainlessRedux,
    schema?: Partial<EntitySchema<T>>,
): Entity<T> => {
    const fullSchema = getFullEntitySchema<T>(schema);
    const actionTypes = createEntityActionTypes(fullSchema.name);
    const actionCreators = createEntityActionCreators<T>(actionTypes);
    const reducer = createEntityReducer<T>(actionTypes);
    const {
        selector,
        dispatcher,
        selectManager,
    } = pr.registerSlot<EntityState<T>, EntityActionTypes, EntityActions>(
        SlotTypes.Entity,
        fullSchema.name,
        reducer,
        actionCreators,
    );
    const selectors = createEntitySelectors<T>(selector, fullSchema.hashFn);
    const idResolver = createIdResolver<T>(fullSchema);

    const dispatchMethods = createDispatchEntityMethods<T>(dispatcher, idResolver);
    const selectMethods = createSelectEntityMethods<T>(selectManager, selectors);
    const mixedMethods = createMixedEntityMethods<T>(dispatchMethods, selectMethods);

    const { changeWithId, resolveChange, ...publicDispatchMethods } = dispatchMethods;
    const { get$, getDictionary$, getById$, ...publicSelectMethods } = selectMethods;

    return {
        ...publicDispatchMethods,
        ...mixedMethods,
        ...publicSelectMethods,
        getPage$: selectMethods.getPage$,
        getPageLoadingState$: selectMethods.getPageLoadingState$,
        getLoadingStateById$: selectMethods.getLoadingStateById$,
        getAll$: selectMethods.getAll$,
        getLoadingState$: selectMethods.getLoadingState$,
        getLoadingStates$: selectMethods.getLoadingStates$,
        // @ts-ignore
        actionCreators,
    };
};
